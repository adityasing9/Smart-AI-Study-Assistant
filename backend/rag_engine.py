import os
from dotenv import load_dotenv
import chromadb
from openai import OpenAI

# Load environment variables
load_dotenv()

# Initialize ChromaDB
chroma_client = chromadb.PersistentClient(path="./data/chromadb")
collection = chroma_client.get_or_create_collection(name="study_notes")

# Setup OpenRouter Client
openai_client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY")
)


def sync_all_notes(notes):
    try:
        existing = collection.get()
        if existing["ids"]:
            collection.delete(ids=existing["ids"])

        if not notes:
            return

        documents, metadatas, ids = [], [], []

        for note in notes:
            content_block = f"Title: {note['title']}\nTags: {', '.join(note.get('tags', []))}\nContent: {note['content']}"
            documents.append(content_block)
            meta = {
                "id": note["id"],
                "title": note["title"],
            }
            if note.get("document_id"):
                meta["document_id"] = note["document_id"]
            metadatas.append(meta)
            ids.append(note["id"])

        collection.add(documents=documents, metadatas=metadatas, ids=ids)

        print(f"[RAG Engine] Synced {len(notes)} notes into vector store.")

    except Exception as e:
        print(f"[RAG Engine Error] Failed to sync notes: {e}")


def add_note_to_vector_store(note):
    try:
        content_block = f"Title: {note['title']}\nTags: {', '.join(note.get('tags', []))}\nContent: {note['content']}"
        meta = {"id": note["id"], "title": note["title"]}
        if note.get("document_id"):
            meta["document_id"] = note["document_id"]
        
        collection.add(
            documents=[content_block],
            metadatas=[meta],
            ids=[note["id"]],
        )
    except Exception as e:
        print(f"[RAG Engine Error] Failed to add note {note['id']}: {e}")


def delete_note_from_vector_store(note_id):
    try:
        collection.delete(ids=[note_id])
    except Exception as e:
        print(f"[RAG Engine Error] Failed to delete note {note_id}: {e}")


def generate_smart_answer(question, document_id=None, image_data=None):
    api_key = os.getenv("OPENROUTER_API_KEY")

    if not api_key:
        return {
            "answer": "⚠️ OPENROUTER_API_KEY is missing.",
            "matched_note": None,
            "keywords": [],
            "related_notes": [],
        }

    # 🔍 Retrieve context
    try:
        where_filter = {"document_id": document_id} if document_id else None
        
        results = collection.query(
            query_texts=[question], 
            n_results=min(3, collection.count()),
            where=where_filter
        )
    except Exception as e:
        return {
            "answer": f"⚠️ Vector DB error: {e}",
            "matched_note": None,
            "keywords": [],
            "related_notes": [],
        }

    if not results["documents"] or not results["documents"][0]:
        return {
            "answer": "No relevant notes found for this document." if document_id else "No relevant notes found.",
            "matched_note": None,
            "keywords": [],
            "related_notes": [],
        }

    docs = results["documents"][0]
    meta = results["metadatas"][0]

    context = "\n\n---\n\n".join(docs)

    # Build message content based on whether an image was provided
    user_content = f"Context:\n{context}\n\nQuestion: {question}"
    if image_data:
        user_content = [
            {
                "type": "text",
                "text": user_content
            },
            {
                "type": "image_url",
                "image_url": {
                    "url": image_data
                }
            }
        ]

    # 🤖 OpenRouter call (FIXED for v1)
    try:
        response = openai_client.chat.completions.create(
            model=os.getenv("OPENROUTER_MODEL", "openrouter/auto"),
            messages=[
                {
                    "role": "system",
                    "content": "You are a smart study assistant. Use the provided context to answer the user's question clearly. Do not use outside knowledge if it contradicts the context.",
                },
                {
                    "role": "user",
                    "content": user_content,
                },
            ],
            temperature=0.3,
            max_tokens=300,
        )

        answer_text = response.choices[0].message.content

    except Exception as e:
        return {
            "answer": f"⚠️ OpenRouter error: {str(e)}",
            "matched_note": meta[0] if meta else None,
            "keywords": [],
            "related_notes": meta[1:] if len(meta) > 1 else [],
        }

    return {
        "answer": answer_text,
        "matched_note": meta[0] if meta else None,
        "keywords": [],
        "related_notes": meta[1:3] if len(meta) > 1 else [],
    }
