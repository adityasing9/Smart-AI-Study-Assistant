import os
from dotenv import load_dotenv
import chromadb
from openai import OpenAI

# Load environment variables
load_dotenv()

# Initialize ChromaDB (Persistent storage in data/ vector DB)
chroma_client = chromadb.PersistentClient(path="./data/chromadb")
collection = chroma_client.get_or_create_collection(name="study_notes")

def sync_all_notes(notes):
    """Clear and re-sync all notes from the JSON DB into the vector store."""
    try:
        # First, clear the collection by getting all ids and deleting them
        existing = collection.get()
        if existing["ids"]:
            collection.delete(ids=existing["ids"])
            
        if not notes:
            return

        documents = []
        metadatas = []
        ids = []

        for note in notes:
            content_block = f"Title: {note['title']}\nTags: {', '.join(note.get('tags', []))}\nContent: {note['content']}"
            documents.append(content_block)
            metadatas.append({
                "id": note["id"],
                "title": note["title"],
            })
            ids.append(note["id"])

        collection.add(
            documents=documents,
            metadatas=metadatas,
            ids=ids
        )
        print(f"[RAG Engine] Synced {len(notes)} notes into vector store.")
    except Exception as e:
        print(f"[RAG Engine Error] Failed to sync notes: {e}")


def add_note_to_vector_store(note):
    """Add a single note to the vector store."""
    try:
        content_block = f"Title: {note['title']}\nTags: {', '.join(note.get('tags', []))}\nContent: {note['content']}"
        collection.add(
            documents=[content_block],
            metadatas=[{"id": note["id"], "title": note["title"]}],
            ids=[note["id"]]
        )
    except Exception as e:
        print(f"[RAG Engine Error] Failed to add note {note['id']}: {e}")


def delete_note_from_vector_store(note_id):
    """Delete a note from the vector store."""
    try:
        collection.delete(ids=[note_id])
    except Exception as e:
        print(f"[RAG Engine Error] Failed to delete note {note_id}: {e}")


def generate_smart_answer(question):
    """
    RAG Pipeline:
    1. Embed question and retrieve top 3 similar notes.
    2. Pass retrieved context to an LLM via OpenRouter to generate answer.
    """
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        return {
            "answer": "⚠️ OPENROUTER_API_KEY is not set in the .env file. Please add an API key to use Smart AI Mode.",
            "matched_note": None,
            "keywords": [],
            "related_notes": []
        }

    # 1. Retrieve Context from Vector Store
    try:
        results = collection.query(
            query_texts=[question],
            n_results=min(3, collection.count())
        )
    except Exception as e:
        return {
            "answer": f"⚠️ Failed to query vector database: {e}",
            "matched_note": None,
            "keywords": [],
            "related_notes": []
        }

    if not results['documents'] or not results['documents'][0]:
         return {
            "answer": "I don't have enough information in your notes to answer this question.",
            "matched_note": None,
            "keywords": [],
            "related_notes": []
        }

    retrieved_docs = results['documents'][0]
    retrieved_metadata = results['metadatas'][0]

    # Combine context
    context = "\n\n---\n\n".join(retrieved_docs)

    # 2. Call LLM
    try:
        client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=api_key
        )
        response = client.chat.completions.create(
            model=os.getenv("OPENROUTER_MODEL", "openrouter/auto"), 
            messages=[
                {"role": "system", "content": "You are a smart, helpful study assistant. Use the provided context from the user's study notes to answer their question accurately. If the context doesn't contain the exact answer, use it to infer or answer to the best of your ability, but clarify if information is missing from their notes."},
                {"role": "user", "content": f"Context notes:\n{context}\n\nQuestion: {question}"}
            ],
            temperature=0.3,
            max_tokens=300
        )
        
        answer_text = response.choices[0].message.content

    except Exception as e:
        return {
            "answer": f"⚠️ Failed to connect to OpenRouter API. Check your key & model. Error: {str(e)[:100]}...",
            "matched_note": retrieved_metadata[0] if retrieved_metadata else None,
            "keywords": [],
            "related_notes": retrieved_metadata[1:] if len(retrieved_metadata) > 1 else []
        }

    # Structure Output (Matching existing API format but with rich RAG data)
    best_match = retrieved_metadata[0] if retrieved_metadata else None
    
    # Send up to 2 related notes
    related = retrieved_metadata[1:3] if len(retrieved_metadata) > 1 else []

    return {
        "answer": answer_text,
        "matched_note": best_match,
        "keywords": [], # Empty keywords to signal frontend it's "Smart Mode" formatting
        "related_notes": related
    }
