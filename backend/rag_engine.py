import os
import json
import httpx
from dotenv import load_dotenv
from openai import OpenAI
import database as db

# Load environment variables
load_dotenv()

# Setup OpenRouter Client
openai_client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY")
)

def get_embedding(text: str) -> list[float]:
    """Fetch embeddings — tries Jina AI direct API first, then OpenRouter as fallback."""
    
    # ── 1. Jina AI Direct API (free tier, most reliable) ──────────────────
    jina_key = os.getenv("JINA_API_KEY")
    if jina_key:
        try:
            response = httpx.post(
                "https://api.jina.ai/v1/embeddings",
                headers={"Authorization": f"Bearer {jina_key}", "Content-Type": "application/json"},
                json={"model": "jina-embeddings-v2-base-en", "input": [text]},
                timeout=20.0
            )
            print(f"[Jina Direct] status={response.status_code}")
            data = response.json()
            if "data" in data and len(data["data"]) > 0:
                print("[Jina Direct] Embedding OK ✓")
                return data["data"][0]["embedding"]
            else:
                print(f"[Jina Direct] Unexpected response: {str(data)[:200]}")
        except Exception as e:
            print(f"[Jina Direct Error] {e}")

    # ── 2. OpenRouter fallback ─────────────────────────────────────────────
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        print("[RAG Engine] No OPENROUTER_API_KEY found.")
        return []
    
    try:
        response = httpx.post(
            "https://openrouter.ai/api/v1/embeddings",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={"model": "jinaai/jina-embeddings-v2-base-en", "input": [text]},
            timeout=20.0
        )
        print(f"[OpenRouter Embed] status={response.status_code}, body={response.text[:300]}")
        response.raise_for_status()
        data = response.json()
        if "data" in data and len(data["data"]) > 0:
            print("[OpenRouter Embed] Embedding OK ✓")
            return data["data"][0]["embedding"]
        else:
            print(f"[OpenRouter Embed] Unexpected response: {str(data)[:200]}")
    except Exception as e:
        print(f"[OpenRouter Embed Error] {e}")

    return []


def sync_all_notes(notes):
    # Disabled for cloud DB to prevent mass overwriting on cold starts
    pass


def add_note_to_vector_store(note):
    try:
        content_block = f"Title: {note['title']}\nTags: {', '.join(note.get('tags', []))}\nContent: {note['content']}"
        embedding = get_embedding(content_block)
        if embedding:
            db.update_note_embedding(note["id"], embedding)
    except Exception as e:
        print(f"[RAG Engine Error] Failed to embed note {note['id']}: {e}")


def delete_note_from_vector_store(note_id):
    # Deletion is natively handled by Supabase database.py calls
    pass


def generate_smart_answer(question, document_id=None, image_data=None, user_id=None):
    api_key = os.getenv("OPENROUTER_API_KEY")

    if not api_key:
        return {
            "answer": "⚠️ OPENROUTER_API_KEY is missing.",
            "matched_note": None,
            "keywords": [],
            "related_notes": [],
        }

    # 🔍 Retrieve context via Supabase vector search
    try:
        query_embedding = get_embedding(question)
        if not query_embedding:
            raise Exception("Failed to generate embedding for the question.")
            
        results = db.match_study_notes(
            query_embedding=query_embedding,
            match_threshold=0.3,
            match_count=3,
            filter_document_id=document_id,
            user_id=user_id
        )
    except Exception as e:
        return {
            "answer": f"⚠️ Vector DB error: {e}",
            "matched_note": None,
            "keywords": [],
            "related_notes": [],
        }

    if not results or len(results) == 0:
        return {
            "answer": "No relevant notes found for this document." if document_id else "No relevant notes found.",
            "matched_note": None,
            "keywords": [],
            "related_notes": [],
        }

    # Format the results
    docs = []
    meta = []
    for r in results:
        content_block = f"Title: {r['title']}\nTags: {', '.join(r.get('tags', []))}\nContent: {r['content']}"
        docs.append(content_block)
        meta.append({
            "id": r["id"],
            "title": r["title"],
            "document_id": r.get("document_id")
        })

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

    # 🤖 OpenRouter call
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
