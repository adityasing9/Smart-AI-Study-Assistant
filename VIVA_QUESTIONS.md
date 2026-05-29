# 🎓 Smart AI Study Assistant — 50 Viva Questions & Answers

This document contains 50 carefully curated viva-voce (oral examination) questions and answers based on the architecture, technologies, and implementation of the **Smart AI Study Assistant**. It is organized by topic to help you ace your project evaluation.

---

## 📂 Category 1: Project Overview & Core Concept

### Q1. What is the main objective of this project?
**Answer:** The objective is to build a full-stack, cloud-native **Smart AI Study Assistant** that allows students to upload textbooks, notes, and diagrams, and then ask questions. The application uses **Retrieval-Augmented Generation (RAG)** to provide accurate, context-aware answers based *only* on the uploaded documents, eliminating AI hallucinations.

### Q2. What is the difference between "Smart Mode" and "Classic Mode" in your app?
**Answer:**
- **Smart Mode** uses advanced AI. It converts the user's question into a mathematical vector, retrieves relevant document chunks from a vector database (using Cosine Similarity), injects them into an LLM (via OpenRouter), and generates a conversational answer.
- **Classic Mode** is a lightweight search engine. It extracts keywords from the question, scores notes using term-frequency and field weighting (Title > Tags > Content) without calling an LLM, and highlights the best matching raw document snippet.

### Q3. What is the high-level architecture of this application?
**Answer:** The application follows a modern decoupled frontend/backend architecture:
- **Frontend**: React.js (Vite) styled with TailwindCSS and animated with Framer Motion.
- **Backend**: FastAPI (Python) running as stateless serverless functions on Vercel.
- **Database**: Supabase PostgreSQL with the `pgvector` extension.
- **AI Integrations**: OpenRouter for LLM text generation/vision APIs and Jina AI for vector embeddings.

### Q4. Why did you choose FastAPI for the backend instead of Flask or Django?
**Answer:** FastAPI is chosen because:
1. It is extremely fast and high-performance, built on ASGI standards (`uvicorn`).
2. It has native support for asynchronous programming (`async/await`), which is crucial for handling slow external API calls (OpenRouter, Supabase).
3. It provides automatic interactive API documentation (Swagger UI).
4. It is lightweight, which keeps cold starts short when deployed as serverless functions on Vercel.

### Q5. Why did you choose React (Vite) for the frontend?
**Answer:** React allows us to build a dynamic, stateful Single Page Application (SPA). Using **Vite** instead of Create React App (CRA) provides lightning-fast build times, instant Hot Module Replacement (HMR) during development, and highly optimized production bundles.

### Q6. Can this project run completely offline?
**Answer:** The current architecture relies on cloud APIs (OpenRouter for LLM/Embeddings and Supabase for cloud database), so it requires an active internet connection. To make it run offline, you would need to host local models (e.g., via Ollama/Llama.cpp) and run a local vector database (like ChromaDB or local Postgres) on the user's machine.

### Q7. What are the main challenges when building a study assistant for students?
**Answer:**
1. **Hallucinations**: LLMs making up facts not present in the study materials. (Solved via RAG).
2. **Parsing complex files**: Handling multi-column PDFs, tables, or scanned diagrams. (Solved using `markitdown` and vision models).
3. **Stateless deployment**: Keeping database entries persistent in serverless environments. (Solved using Supabase cloud DB).

### Q8. What security measures did you implement for this application?
**Answer:**
1. All API keys and database credentials are kept on the backend inside a secure `.env` file, never exposed to the client.
2. CORS policies are configured to control which domains can request resources from the FastAPI backend.
3. Database requests are made through secure, authenticated Supabase clients.

---

## 📄 Category 2: NLP, Parsing, & Document Ingestion

### Q9. How does the system extract text from uploaded files (PDFs, Word, Excel)?
**Answer:** The backend uses Microsoft's **`markitdown`** library. When a file is uploaded, it is written to a temporary location, parsed by `markitdown` (which extracts plain text and formats tables/structures into clean markdown), and then deleted.

### Q10. What is "Chunking" and why is it necessary in a RAG pipeline?
**Answer:** Chunking is the process of splitting a long document into smaller, readable text blocks. It is necessary because:
1. LLMs have strict input context limits (token window).
2. Embedding a whole 100-page book into a single vector dilutes the semantic details. Smaller chunks (e.g., 1,500 characters) ensure vector search targets highly specific sections.

### Q11. How is chunking implemented in your backend code?
**Answer:** In `main.py`, we split the extracted text into paragraphs using double newlines (`\n\n`). We then iterate through them, grouping paragraphs together until a chunk reaches approximately 1,500 characters. If a document has no paragraph breaks, we segment the text directly by size.

### Q12. What is the purpose of overlapping chunks, and did you implement it?
**Answer:** Chunk overlapping (e.g., keeping a 100–200 character overlap between consecutive chunks) prevents splitting a critical sentence or concept right down the middle, ensuring context is preserved across boundaries. In our current implementation, chunks are created by appending whole paragraphs together (not splitting mid-sentence), which naturally preserves context at paragraph boundaries.

### Q13. How does Classic Mode parse text search queries?
**Answer:** Classic Mode uses **keyword extraction**. It takes the query, converts it to lowercase, removes punctuation, tokenizes it into words, and filters out common "stop words" (e.g., *the, is, and, explain, please*) to isolate the primary content keywords.

### Q14. What are "Stop Words"?
**Answer:** Stop words are common words in a language (like *a, an, the, on, are, what*) that carry very little semantic weight. Removing them allows keyword-based matching systems to focus entirely on the main search terms (e.g., "explain photosynthesis" becomes just `['photosynthesis']`).

### Q15. How does the system handle images uploaded to the chat interface?
**Answer:** The React frontend reads the clipboard image when the user pastes it (`Ctrl+V`), encodes it into a **Base64 Data URL**, and sends it in the JSON request payload. The backend detects the image data, packages it in a multimodal format (with `image_url` type), and sends it directly to OpenRouter's vision API alongside the text context.

---

## 🧮 Category 3: Vector Embeddings & Similarity Math

### Q16. What is a Vector Embedding?
**Answer:** A vector embedding is a numerical representation of the semantic meaning of text. It converts words, sentences, or paragraphs into an array of floating-point numbers. Words or sentences with similar meanings are mathematically mapped closer together in this high-dimensional vector space.

### Q17. Which embedding model did you use, and what is its dimension size?
**Answer:** We used **`jina-embeddings-v2-base-en`** via the OpenRouter API. It generates embeddings with **768 dimensions** (meaning each text chunk is represented by an array of 768 floating-point numbers).

### Q18. What is Cosine Similarity? Explain the math behind it.
**Answer:** Cosine similarity measures the cosine of the angle between two vectors in a high-dimensional space. It determines how similar two pieces of text are, regardless of their length. The formula is:

**Similarity = cos(θ) = (A · B) / (||A|| × ||B||)**

- A similarity of **1.0** means the vectors point in the exact same direction (semantically identical).
- A similarity of **0.0** means they are orthogonal (unrelated).
- In pgvector, we compute this using `1 - (embedding <=> query_embedding)`, where `<=>` is the cosine distance operator.

### Q19. Why is Cosine Similarity preferred over Euclidean Distance for text search?
**Answer:** Cosine similarity measures the *angle* between vectors, focusing entirely on semantic direction. Euclidean distance measures the straight-line distance, which is highly sensitive to text length (magnitude). A short paragraph and a long paragraph discussing the same topic might have a large Euclidean distance but will have a very high Cosine Similarity.

### Q20. What is a 768-dimensional space conceptually?
**Answer:** It means the model analyzes 768 distinct semantic properties (or features) of the text — such as tense, subject type, sentiment, and academic domain. The position of the text on each of these 768 axes determines its unique vector coordinates. While we cannot visualize 768 dimensions, the mathematical operations (like distance and angle) work identically to 2D or 3D geometry.

### Q21. What happens if the embedding API fails or responds slowly?
**Answer:** We implement timeout handling (15.0 seconds in `httpx`) and standard `try-except` blocks. If the embedding generation fails, the system logs the error and returns an empty list, causing the search to gracefully return a "no relevant notes found" message rather than crashing.

### Q22. Why do we generate embeddings for the user's question during query time?
**Answer:** In a vector-search system, we cannot search raw text against stored vectors. We must translate the user's question into the same 768-dimensional mathematical coordinate space as our document chunks so that we can compute cosine similarity and find the most relevant matches.

### Q23. How does Jina Embeddings v2 handle long-context inputs compared to standard models?
**Answer:** Jina Embeddings v2 supports an extended context window (up to 8,192 tokens), making it well-suited for academic text. This allows embedding full paragraphs without truncation, preserving their semantic depth.

---

## 🗄️ Category 4: Supabase, PostgreSQL & Vector Databases

### Q24. What is pgvector, and why is it useful?
**Answer:** `pgvector` is an open-source vector similarity search extension for **PostgreSQL**. It allows Postgres to store vectors (embeddings) directly in table columns, and perform fast similarity calculations (Cosine, L2, Inner Product) using native SQL queries. This eliminates the need for a separate vector database service.

### Q25. Why did you migrate from ChromaDB (local) to Supabase pgvector (cloud)?
**Answer:** ChromaDB is a local, stateful file-based vector database. In a **serverless cloud backend** (like Vercel), server instances are stateless and ephemeral — any local database files are wiped on every cold start. Migrating to Supabase (a hosted PostgreSQL database in the cloud) ensures all documents, embeddings, and chat history are permanently persisted and accessible from anywhere.

### Q26. Explain the database schema you created in Supabase.
**Answer:** We created two main tables and one stored procedure:
1. **`study_notes`**: Stores the text chunks. Columns: `id` (text, primary key), `title` (text), `content` (text), `tags` (text[]), `document_id` (text), `document_title` (text), and `embedding` (vector(768)).
2. **`ask_history`**: Stores chat history. Columns: `id` (text, primary key), `question` (text), `answer` (text), `asked_at` (timestamptz), and `matched_note_id` (text).
3. **`match_study_notes`** (stored procedure/RPC): Executes the cosine similarity search server-side and returns matching rows.

### Q27. What is an RPC in Supabase, and how did you use it?
**Answer:** RPC stands for **Remote Procedure Call**. It is a way to execute a custom SQL function stored inside the Postgres database from our Python code. We call `match_study_notes` via `supabase.rpc("match_study_notes", params)`, passing the query embedding, match threshold, and match count. The complex vector similarity math runs entirely inside the database server.

### Q28. How does the filtering by `document_id` work in your vector search?
**Answer:** In the SQL definition of `match_study_notes`, we have a parameter `filter_document_id`. The SQL query includes:
```sql
where (filter_document_id is null or study_notes.document_id = filter_document_id)
```
If the user scopes their chat to a specific uploaded document, only vector entries belonging to that document are compared — optimizing speed and accuracy.

### Q29. What is the significance of the `match_threshold` parameter?
**Answer:** The `match_threshold` (set to 0.3) filters out irrelevant chunks. If the similarity score between a document chunk and the query vector is lower than 0.3, it is excluded from the results. This prevents the LLM from receiving completely unrelated context when a student asks off-topic questions.

### Q30. How does your application connect to Supabase from Python?
**Answer:** We use the official `supabase` Python SDK. It reads the `SUPABASE_URL` and `SUPABASE_ANON_KEY` from backend environment variables and initializes a connection client to run queries, inserts, and RPC calls.

### Q31. What is a vector index (e.g., HNSW or IVFFlat)?
**Answer:** Vector indexes speed up similarity search on large datasets:
- **IVFFlat (Inverted File Flat)**: Segments vectors into clusters and searches only the most relevant clusters. Faster but requires periodic rebuilding.
- **HNSW (Hierarchical Navigable Small World)**: Creates a multi-layered graph for approximate nearest-neighbour search. Higher recall and faster queries, but uses more memory.

---

## 🤖 Category 5: Retrieval-Augmented Generation (RAG) & LLMs

### Q32. What is Retrieval-Augmented Generation (RAG)?
**Answer:** RAG is an architectural pattern that improves the outputs of Large Language Models. Instead of relying solely on the LLM's pre-trained knowledge, a RAG system first **retrieves** relevant documents from an external source (a vector database), **augments** the user's prompt by adding these documents as context, and then lets the LLM **generate** an answer based on this grounded context.

### Q33. How does RAG prevent LLM hallucinations?
**Answer:** Hallucinations occur because LLMs are trained to predict the next word, sometimes generating plausible-sounding but false facts. RAG prevents this by supplying the actual reference text directly inside the prompt and instructing the model: *"Answer this question using only the provided context. Do not use outside knowledge if it contradicts the context."*

### Q34. What is OpenRouter, and why did you use it instead of calling OpenAI directly?
**Answer:** OpenRouter is a unified API gateway that aggregates dozens of state-of-the-art LLMs (from OpenAI, Anthropic, Google, Meta, etc.) under a single standard API format. Benefits:
1. Swap underlying LLMs (Gemini → GPT-4o → Claude) with a simple environment variable change — zero code changes.
2. Competitive, pay-as-you-go pricing.
3. Unified format for both text generation and embedding APIs.

### Q35. How is the RAG prompt structured in your code?
**Answer:** In `rag_engine.py`, the prompt has two parts:
- **System Prompt**: *"You are a smart study assistant. Use the provided context to answer the user's question clearly. Do not use outside knowledge if it contradicts the context."*
- **User Prompt**: Includes the retrieved context chunks separated by `---` dividers, followed by the user's question.

### Q36. What temperature setting did you use for the LLM, and why?
**Answer:** We set the temperature to **0.3** (a low value). Lower temperatures make LLM output deterministic, focused, and factual — ideal for a study assistant where accuracy matters. Higher temperatures (like 0.8+) make responses creative and unpredictable, which is undesirable for academic Q&A.

### Q37. How does the application handle questions that are NOT found in the uploaded documents?
**Answer:** Two safeguards:
1. **Vector search threshold**: If no chunks score above the 0.3 similarity threshold, the system returns "No relevant notes found" without calling the LLM at all.
2. **System prompt instruction**: If chunks are returned but don't contain the exact answer, the LLM is instructed to state that the information is not present in the provided study materials.

### Q38. Why do we retrieve only the top 3 chunks instead of all matching chunks?
**Answer:** Retrieving only 3 chunks balances accuracy and cost:
1. **Token limits**: LLMs have maximum context windows; sending too many chunks exceeds this limit.
2. **Cost**: More tokens = higher API cost per request.
3. **Noise reduction**: Adding marginally relevant chunks can actually confuse the LLM and degrade answer quality.

---

## ⚡ Category 6: Backend, Serverless & Deployment

### Q39. What is a "Serverless Function" and how does Vercel run your Python backend?
**Answer:** A serverless function is a stateless code execution block triggered by an HTTP request. Vercel automatically converts our FastAPI endpoints into serverless containers. When an API call arrives, Vercel routes it to our FastAPI app, computes the response, and tears down the container. There is no permanently running server.

### Q40. What configuration file tells Vercel how to deploy your FastAPI backend?
**Answer:** The `vercel.json` file in the backend directory. It specifies that all requests should be routed to `main.py` using the `@vercel/python` builder, enabling Vercel to treat our FastAPI app as a serverless Python function.

### Q41. How did you implement CORS in your FastAPI app?
**Answer:** We imported `CORSMiddleware` from FastAPI and configured it with:
```python
allow_origins=["*"]
allow_methods=["*"]
allow_headers=["*"]
```
This allows the React frontend (hosted on a different Vercel domain) to safely make cross-origin API requests without browser CORS blocking.

### Q42. What is the purpose of `requirements.txt`?
**Answer:** It lists all the Python dependencies (like `fastapi`, `supabase`, `markitdown`, `openai`, `httpx`) required to run the backend. When deploying to Vercel, the platform reads this file and installs all packages automatically in the build environment before serving requests.

### Q43. How is temporary file storage handled in a serverless environment?
**Answer:** Serverless environments lack persistent local filesystems. To parse uploaded documents, we use Python's built-in `tempfile` module to create a temporary file, run `markitdown` on it immediately, extract the text, and then delete the file with `os.remove()` — all within the same request lifecycle.

### Q44. What is the FastAPI `lifespan` event used for in your app?
**Answer:** The `lifespan` context manager in FastAPI handles startup/shutdown logic. In our app, it was originally used to synchronize local notes into the vector store on server start. After cloud migration, this sync is disabled for Supabase to prevent mass re-embedding on every cold start, but the structure remains for future initialization tasks.

---

## 🎨 Category 7: Frontend, UI/UX & Interactive Features

### Q45. What is "Glassmorphism" in UI design?
**Answer:** Glassmorphism is a modern design trend characterized by translucent, frosted-glass-like elements. It is achieved using CSS `backdrop-filter: blur()`, thin semi-transparent white borders, and soft shadows, overlaid on vibrant gradient backgrounds to give a premium, layered, depth-rich aesthetic.

### Q46. How does the speech recognition feature work in the frontend?
**Answer:** It uses the browser's native **Web Speech API** (`window.SpeechRecognition` or `window.webkitSpeechRecognition`). When the user clicks the microphone button, the browser accesses the device microphone, listens to the user's voice, converts the audio into text using the browser's built-in speech engine, and populates the chat input field.

### Q47. How does the Text-to-Speech (TTS) feature read answers back to the student?
**Answer:** It uses the **SpeechSynthesis** interface of the Web Speech API (`window.speechSynthesis`). We create a `SpeechSynthesisUtterance` instance with the LLM's text response, select an available system voice, and call the browser's synthesis engine to speak the text aloud — enabling hands-free studying.

### Q48. How does the frontend display Markdown tables, code blocks, and lists from the LLM?
**Answer:** We use the **`react-markdown`** package. It parses raw markdown strings returned by the LLM and dynamically renders them as properly formatted HTML elements (like `<table>`, `<ul>`, `<code>`, `<pre>`) styled with Tailwind classes — rather than showing raw plain text with asterisks and pipes.

### Q49. What is Framer Motion, and where is it used?
**Answer:** Framer Motion is a popular React animation library. We use it for:
- **Chat bubble animations** — messages fade and slide in smoothly.
- **Page transitions** — routes crossfade between dashboard and chat pages.
- **Card hover effects** — dashboard cards scale and glow on hover.
This makes the application feel responsive and premium.

### Q50. How does the React frontend communicate with the FastAPI backend across different domains?
**Answer:** In `api.js`, we define an `API_BASE` URL that reads the `VITE_API_URL` environment variable. If not set, it falls back to the live production Vercel backend URL (`https://backend-seven-wine-16.vercel.app/api`). All API fetch requests use this base URL with standard `fetch()` calls, sending/receiving JSON payloads.

---

*Prepared for the AI Mini Project — Smart AI Study Assistant. Good luck with your viva! 🎓*
