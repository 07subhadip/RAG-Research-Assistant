from app.rag_pipeline import RAGPipeline
from rich.console import Console
from rich.markdown import Markdown

console = Console()

if __name__ == "__main__":
    print("Testing Full Pipeline till Vector Store...\n")

    rag = RAGPipeline(
        data_path = "data/raw",
        vectorstore_path = "vectorstore"
    )

    rag.load_documents()

    rag.split_documents()

    rag.create_embeddings()

    rag.create_vectorstore()

    rag.create_retriever()

    rag.setup_llm()

    rag.create_rag_chain()

    print("\nRAG System Ready! Ask Questions about your research papers.")
    print("Type 'exit' to quit.\n")

    while True:
        query = input("Ask: ")

        if query.lower() == 'exit':
            break

        answer = rag.rag_chain.invoke(query)

        print('\nAnswer:\n')
        console.print(Markdown(answer)) 
        print("-" * 50)