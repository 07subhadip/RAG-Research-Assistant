rag-research-assistant/
│
├── app/                      # Main application logic
│   ├── __init__.py
│   │
│   ├── core/                 # Core configs & settings
│   │   ├── config.py
│   │   └── constants.py
│   │
│   ├── ingestion/            # Document loading & processing
│   │   ├── loader.py
│   │   ├── splitter.py
│   │   └── embedder.py
│   │
│   ├── retrieval/            # Vector DB + Retriever logic
│   │   ├── vector_store.py
│   │   └── retriever.py
│   │
│   ├── chains/               # LangChain chains (LCEL)
│   │   └── rag_chain.py
│   │
│   ├── api/                  # FastAPI endpoints (for deployment)
│   │   └── main.py
│   │
│   └── utils/                # Helper functions
│       └── helpers.py
│
├── data/                     # Raw documents (PDFs, txt, etc.)
│   ├── raw/
│   └── processed/
│
├── vectorstore/              # Saved embeddings (FAISS/Chroma)
│
├── notebooks/                # Experiments (optional)
│   └── experiments.ipynb
│
├── tests/                    # (Optional but good for resume)
│   └── test_rag.py
│
├── .env                      # API keys (HF token)
├── requirements.txt
├── .gitignore
├── README.md
└── run.py                    # Entry point (CLI testing)
