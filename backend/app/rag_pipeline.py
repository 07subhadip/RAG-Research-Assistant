import os
from dotenv import load_dotenv

# -------------------
# LangChain Imports
# -------------------

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEndpoint, ChatHuggingFace, HuggingFaceEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough


load_dotenv()

HF_API_KEY = os.getenv("HUGGINGFACEHUB_ACCESS_TOKEN")


class RAGPipeline:
    def __init__(self, data_path = "data/raw", vectorstore_path = "vectorstore"):
        """
        Args:
            data_path: Folder where PDFs are stored
            vectorstore_path: Folder where FAISS index will be saved
        """

        self.data_path = data_path
        self.vectorstore_path = vectorstore_path

        self.documents = None
        self.chunks = None
        self.embeddings = None
        self.vectorstore = None
        self.retriever = None
        self.llm = None
        self.rag_chain = None


    def load_documents(self):
        """
        Load all PDF documents from the data/raw folder
        """

        print(f"Loading PDF documents from : {self.data_path}")

        documents = []

        for file in os.listdir(self.data_path):
            if file.endswith(".pdf"):
                file_path = os.path.join(self.data_path, file)
                print(f"Reading: {file}")

                loader = PyPDFLoader(file_path)
                docs = loader.load()
                documents.extend(docs)

        self.documents = documents

        print(f"Total Pages loaded: {len(self.documents)}")

        return self.documents


    def split_documents(self, chunk_size = 1000, chunk_overlap = 200):
        """
        Split loaded documents into smaller chunks for better RAG retrieval
        """

        if self.documents is None:
            raise ValueError("No Documents found. Run load_documents() first.")

        print("Splitting documents into chunka")
        print(f"Chunk Size: {chunk_size}, Overlap: {chunk_overlap}")

        splitter = RecursiveCharacterTextSplitter(
            chunk_size = chunk_size,
            chunk_overlap = chunk_overlap
        )

        chunks = splitter.split_documents(self.documents)

        self.chunks = chunks

        print(f"Total Chunks Created: {len(self.chunks)}")

        return self.chunks


    def create_embeddings(self):
        """
        Create HuggingFace embedding model (for semantic search)
        """

        print("\nLoading HuggingFace Embedding Model")

        embeddings = HuggingFaceEmbeddings(
            model_name = "sentence-transformers/all-MiniLM-L6-v2"
        )

        self.embeddings = embeddings

        print("Embedding model loaded successfully!")

        return self.embeddings


    def create_vectorstore(self):
        """
        Create FAISS vector database from document chunks
        """

        if self.chunks is None:
            raise ValueError("No chunks found. Run split_documents() first.")

        if self.embeddings is None:
            raise ValueError("Embedding not Initialized. Run create_embedding() first.")

        print("Creating FAISS Vector Store from chunks")

        vectorstore = FAISS.from_documents(
            documents = self.chunks,
            embedding = self.embeddings
        )
        
        self.vectorstore = vectorstore

        self.vectorstore.save_local(self.vectorstore_path)

        print(f"Vectore Store created and saved at: {self.vectorstore_path}")

        return self.vectorstore


    def create_retriever(self, k = 4):
        """
        Create retriever from FAISS Vector Store
        k = Number of relevant chunks to retrieve
        """

        if self.vectorstore is None:
            raise ValueError("VectorStore not found. Run create_vectorstore() first.")

        print("\nCreating Retriever (Semantic Search)!")
        print(f"To k chunks to retrieve: {k}")

        retriever = self.vectorstore.as_retriever(
            search_type = "similarity",
            search_kwargs = {
                "k": k
            }
        )

        self.retriever = retriever

        print("Retriever Created Successfully!")

        return self.retriever


    def setup_llm(self):
        """
        Initialize Huggingface LLM via Inference API
        """

        print("Loading Huggingface LLM mistralai/Mistral-7B-Instruct-v0.2")

        llm_backend = HuggingFaceEndpoint(
            repo_id = "mistralai/Mistral-7B-Instruct-v0.2",
            task = "text-generation",
            temperature = 0.3,
            huggingfacehub_api_token = HF_API_KEY,
            max_new_tokens = 2048
        )

        chat_model = ChatHuggingFace(llm = llm_backend)

        self.llm = chat_model

        print("Chat LLM loaded Successfully")

        return self.llm


    def create_rag_prompt(self):
        """
        Create RAG prompt template
        """

        print("\nCreating RAG Prompt Template")

        prompt = ChatPromptTemplate.from_template(
            """
            You are an Expert AI Research Assistant.

            Strict Rules:
            - Answer ONLY from the provided context
            - Do NOT mix unrelated papers unless necessary 
            - If multiple sources exist, clearly synthesize them
            - If answer not in context, say: "I don't know based on the documents"

            Context:
            {context}

            Question:
            {question}

            Give:
            1. Clear Answer
            2. Key Points (if needed)
            3. Mention which paper the answer is mainly from
            """
        )

        print("RAG Prompt Created")

        return prompt

    
    def create_rag_chain(self):
        """
        Create full RAG Chain using LCEL
        """

        if self.retriever is None:
            raise ValueError("Retriever Not initialized.")

        if self.llm is None:
            raise ValueError("LLM not initialized")

        print("Creating LCEL RAG Chain")

        prompt = self.create_rag_prompt()

        def format_docs(docs):
            """
            Format retrieved docs with source + page info (for citation)
            """

            formatted = []

            for i, doc in enumerate(docs, 1):
                source = doc.metadata.get("source", "Unknown")
                page = doc.metadata.get("page", "N/A")

                chunk_text = f"""
                [Source: {i}]
                File: {os.path.basename(source)}
                Page: {page}

                Content:
                {doc.page_content}
                """
                formatted.append(chunk_text)

            return "\n\n".join(formatted)

        rag_chain = (
            {
                "context": self.retriever | format_docs,
                "question": RunnablePassthrough()
            }
            | prompt
            | self.llm
            | StrOutputParser()
        )

        self.rag_chain = rag_chain

        print("RAG Chain created successfully.")

        return self.rag_chain