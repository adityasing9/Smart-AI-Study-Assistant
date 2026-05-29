# 🧠 Smart AI Study Assistant

![Smart AI Study Assistant](https://img.shields.io/badge/Status-Live-success) ![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB) ![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi) ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white) ![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)

A full-stack, cloud-native **AI Study Assistant** that uses **Retrieval-Augmented Generation (RAG)** to answer questions based entirely on your uploaded documents, notes, and images.

Built as an AI mini-project, this application allows users to upload any document (PDF, Excel, Word), paste images directly into the chat, or use their voice to ask questions. The AI intelligently retrieves relevant context from a Supabase vector database and synthesizes accurate, hallucination-free answers.

## ✨ Key Features

- **📄 Universal Document Parsing**: Upload PDFs, Word documents, Excel sheets, and text files. The app extracts text natively without complex setups using `markitdown`.
- **🔍 Retrieval-Augmented Generation (RAG)**: Chat directly with your documents. The AI strictly answers based on the uploaded notes, preventing hallucinations.
- **👁️ Multimodal Vision Support**: Paste an image (diagrams, charts, math problems) directly into the chat. The application uses OpenRouter's Vision models to "see" the image and answer complex queries.
- **🎙️ Voice-to-Text & Text-to-Speech**: Hands-free studying! Dictate your questions using the microphone, and have the AI read the answers back to you.
- **☁️ 100% Serverless Cloud Architecture**: The backend runs entirely on stateless Vercel Python serverless functions, connected to a Supabase Postgres database.
- **🧠 Advanced Vector Search**: Uses `jina-embeddings-v2` and Supabase `pgvector` for hyper-accurate semantic similarity matching.
- **🎨 Glassmorphism UI**: A beautiful, modern, and highly responsive user interface built with React, TailwindCSS, and Framer Motion.

---

## 🧠 Core Technologies Explained

### 1. The NLP Pipeline: Data Ingestion (How the AI "Reads")
When a document (PDF, Word, etc.) is uploaded, the system triggers a powerful **Natural Language Processing (NLP)** pipeline:
- **Text Extraction**: The backend uses NLP libraries (`markitdown`, `pdfminer`) to parse binary files and extract raw, readable text.
- **Chunking**: Large documents are split into smaller paragraphs (~1500 characters) to optimize the LLM's context window.
- **Semantic Embedding**: Each text chunk is sent to an embedding model (`jina-embeddings-v2-base-en`). The NLP model converts the text's *semantic meaning* into a **768-dimensional mathematical vector**.
- **Vector Storage**: These vectors are saved securely into a Supabase database using the `pgvector` extension.

### 2. The RAG Pipeline: Query & Generation (How the AI "Thinks")
When you ask a question in "Smart AI" mode, the **Retrieval-Augmented Generation (RAG)** pipeline executes:
- **Retrieval**: The backend converts your question into a 768-dimensional vector and runs a **Cosine Similarity Search** in Supabase to find the top 3 paragraphs that are mathematically "closest" in meaning to your question.
- **Augmentation**: The backend creates a hidden prompt, injecting those 3 retrieved paragraphs as strict context.
- **Generation**: The Large Language Model (e.g., Gemini or GPT-4o) reads the augmented prompt and generates a conversational answer based *only* on the retrieved context, effectively eliminating hallucinations.

---

## 🏗️ Architecture & Tech Stack

### Frontend
- **React.js (Vite)**: Fast, modern frontend framework.
- **TailwindCSS**: For responsive, utility-first styling.
- **Framer Motion**: For fluid micro-animations and page transitions.
- **React Markdown**: To render beautifully formatted tables, code, and text from the LLM.
- **Web Speech API**: For native voice recognition and speech synthesis.

### Backend
- **FastAPI (Python)**: High-performance backend framework serving as a stateless serverless API on Vercel.
- **Supabase (PostgreSQL)**: Primary cloud database storing notes and chat history.
- **pgvector**: PostgreSQL extension used to store 768-dimensional embeddings and perform cosine similarity math.
- **OpenRouter API**: Accesses state-of-the-art LLMs (Gemini, Claude, GPT-4o) and Vision models through a single endpoint.
- **Jina AI**: Used via OpenRouter for blazing-fast text embeddings.

---

## 🚀 Live Demo

- **Frontend Application**: [https://frontend-alpha-six-41.vercel.app](https://frontend-alpha-six-41.vercel.app)
- **Backend API Endpoint**: [https://backend-seven-wine-16.vercel.app](https://backend-seven-wine-16.vercel.app)

---

## 🛠️ Local Setup & Installation

If you want to run this project locally on your machine, follow these steps:

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- An [OpenRouter](https://openrouter.ai/) API Key
- A [Supabase](https://supabase.com/) Project with `pgvector` enabled

### 1. Clone the Repository
```bash
git clone https://github.com/adityasing9/Smart-AI-Study-Assistant.git
cd Smart-AI-Study-Assistant
```

### 2. Backend Setup
```bash
cd backend

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup Environment Variables
# Create a .env file in the backend folder:
# SUPABASE_URL="your-supabase-project-url"
# SUPABASE_ANON_KEY="your-supabase-anon-key"
# OPENROUTER_API_KEY="your-openrouter-key"

# Run the FastAPI server
python -m uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd ../frontend

# Install Node modules
npm install

# Setup Environment Variables
# Create a .env file in the frontend folder:
# VITE_API_URL="http://127.0.0.1:8000/api"

# Start the Vite development server
npm run dev
```

---

## 📖 How to Use

1. **Upload Documents**: Navigate to the Dashboard and click "Add Notes" -> "Upload Document". Select any PDF or file to seed the AI's memory.
2. **Ask Questions**: Go to the "Ask AI" page. Type a question related to the uploaded document.
3. **Smart Mode vs Classic Mode**: 
   - *Smart Mode*: Uses embeddings, vector search, and the LLM to synthesize a conversational answer.
   - *Classic Mode*: Performs a fast, direct keyword lookup and returns the raw matching text chunk.
4. **Paste Images**: Copy an image and press `Ctrl+V` in the chat input. The UI will preview the image, and you can ask the AI to explain it!

---

*Built with ❤️ for better, smarter studying.*
