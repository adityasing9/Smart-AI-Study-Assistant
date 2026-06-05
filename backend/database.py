import os
import uuid
import json
import math
from datetime import datetime
from pathlib import Path
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_ANON_KEY", "")

try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None
except Exception as e:
    print(f"Supabase client failed to initialize: {e}")
    supabase = None

# ──────────────────────────── Local JSON Fallback ────────────────────────────

DATA_DIR = Path(__file__).parent / "data"
NOTES_FILE = DATA_DIR / "notes.json"

def _ensure_data_file():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not NOTES_FILE.exists():
        with open(NOTES_FILE, "w", encoding="utf-8") as f:
            json.dump({"notes": [], "history": []}, f)

def _read_db():
    _ensure_data_file()
    try:
        with open(NOTES_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"Failed to read local JSON database: {e}")
        return {"notes": [], "history": []}

def _write_db(data):
    _ensure_data_file()
    try:
        with open(NOTES_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Failed to write to local JSON database: {e}")

# ──────────────────────────── Database Operations ────────────────────────────

def get_all_notes(user_id: str = None):
    if supabase:
        try:
            query = supabase.table("study_notes").select("*")
            if user_id:
                query = query.eq("user_id", user_id)
            response = query.execute()
            return response.data
        except Exception as e:
            print(f"Supabase get_all_notes failed: {e}. Falling back to local JSON.")
            
    db_data = _read_db()
    notes = db_data.get("notes", [])
    if user_id:
        notes = [n for n in notes if n.get("user_id") == user_id]
    try:
        notes = sorted(notes, key=lambda n: n.get("created_at", ""), reverse=True)
    except Exception:
        pass
    return notes

def search_notes(query: str, user_id: str = None):
    if supabase:
        try:
            q = supabase.table("study_notes").select("*").ilike("content", f"%{query}%")
            if user_id:
                q = q.eq("user_id", user_id)
            response = q.execute()
            return response.data
        except Exception as e:
            print(f"Supabase search_notes failed: {e}. Falling back to local JSON.")
            
    db_data = _read_db()
    query_lower = query.lower()
    notes = [
        n for n in db_data.get("notes", [])
        if query_lower in n.get("title", "").lower() or query_lower in n.get("content", "").lower()
    ]
    if user_id:
        notes = [n for n in notes if n.get("user_id") == user_id]
    return notes

def add_note(title, content, tags=None, document_id=None, document_title=None, user_id=None):
    if tags is None:
        tags = []
    
    note = {
        "id": str(uuid.uuid4())[:8],
        "title": title.strip(),
        "content": content.strip(),
        "tags": tags,
        "document_id": document_id,
        "document_title": document_title,
        "user_id": user_id,
        "created_at": datetime.utcnow().isoformat() + "Z"
    }
    
    if supabase:
        try:
            supabase.table("study_notes").insert(note).execute()
            return note
        except Exception as e:
            print(f"Supabase add_note failed: {e}. Writing to local JSON database.")
            
    db_data = _read_db()
    db_data.setdefault("notes", []).append(note)
    _write_db(db_data)
    return note

def update_note_embedding(note_id: str, embedding: list):
    if supabase:
        try:
            supabase.table("study_notes").update({"embedding": embedding}).eq("id", note_id).execute()
            return
        except Exception as e:
            print(f"Supabase update_note_embedding failed: {e}. Updating local JSON.")
            
    db_data = _read_db()
    for note in db_data.get("notes", []):
        if note.get("id") == note_id:
            note["embedding"] = embedding
            break
    _write_db(db_data)

def delete_note(note_id, user_id: str = None):
    if supabase:
        try:
            query = supabase.table("study_notes").delete().eq("id", note_id)
            if user_id:
                query = query.eq("user_id", user_id)
            query.execute()
            return True
        except Exception as e:
            print(f"Supabase delete_note failed: {e}. Deleting from local JSON.")
            
    db_data = _read_db()
    original_len = len(db_data.get("notes", []))
    db_data["notes"] = [n for n in db_data.get("notes", []) if n.get("id") != note_id]
    if len(db_data["notes"]) < original_len:
        _write_db(db_data)
        return True
    return False

def get_history(user_id: str = None):
    if supabase:
        try:
            query = supabase.table("ask_history").select("*").order("asked_at", desc=True)
            if user_id:
                query = query.eq("user_id", user_id)
            response = query.execute()
            return response.data
        except Exception as e:
            print(f"Supabase get_history failed: {e}. Falling back to local JSON.")
            
    db_data = _read_db()
    history = db_data.get("history", [])
    if user_id:
        history = [h for h in history if h.get("user_id") == user_id]
    try:
        history = sorted(history, key=lambda h: h.get("asked_at", ""), reverse=True)
    except Exception:
        pass
    return history

def add_history_entry(question, answer, matched_note_id=None, user_id=None):
    entry = {
        "id": str(uuid.uuid4())[:8],
        "question": question,
        "answer": answer,
        "matched_note_id": matched_note_id,
        "user_id": user_id,
        "asked_at": datetime.utcnow().isoformat() + "Z"
    }
    if supabase:
        try:
            supabase.table("ask_history").insert(entry).execute()
            return
        except Exception as e:
            print(f"Supabase add_history_entry failed: {e}. Saving to local JSON.")
            
    db_data = _read_db()
    db_data.setdefault("history", []).append(entry)
    if len(db_data["history"]) > 50:
        db_data["history"] = db_data["history"][-50:]
    _write_db(db_data)

def get_documents(user_id: str = None):
    if supabase:
        try:
            query = supabase.table("study_notes").select("document_id, document_title").not_.is_("document_id", "null")
            if user_id:
                query = query.eq("user_id", user_id)
            response = query.execute()
            docs = {}
            for note in response.data:
                if note.get("document_id"):
                    docs[note["document_id"]] = note.get("document_title", "Untitled Document")
            return [{"document_id": k, "document_title": v} for k, v in docs.items()]
        except Exception as e:
            print(f"Supabase get_documents failed: {e}. Falling back to local JSON.")
            
    db_data = _read_db()
    docs = {}
    for n in db_data.get("notes", []):
        if user_id and n.get("user_id") != user_id:
            continue
        if n.get("document_id"):
            docs[n["document_id"]] = n.get("document_title", "Untitled Document")
    return [{"document_id": k, "document_title": v} for k, v in docs.items()]

def match_study_notes(query_embedding: list, match_threshold: float = 0.5, match_count: int = 3, filter_document_id: str = None, user_id: str = None):
    if supabase:
        params = {
            "query_embedding": query_embedding,
            "match_threshold": match_threshold,
            "match_count": match_count
        }
        if filter_document_id:
            params["filter_document_id"] = filter_document_id
        if user_id:
            params["p_user_id"] = user_id
            
        try:
            response = supabase.rpc("match_study_notes", params).execute()
            results = response.data
            return results
        except Exception as e:
            print(f"Supabase RPC match_study_notes failed: {e}. Falling back to local search.")
            
    db_data = _read_db()
    matched_notes = []
    
    def get_similarity(v1, v2):
        if not v1 or not v2 or len(v1) != len(v2):
            return 0.0
        dot_product = sum(a * b for a, b in zip(v1, v2))
        m1 = math.sqrt(sum(a * a for a in v1))
        m2 = math.sqrt(sum(b * b for b in v2))
        if not m1 or not m2:
            return 0.0
        return dot_product / (m1 * m2)

    for note in db_data.get("notes", []):
        if user_id and note.get("user_id") != user_id:
            continue
        if filter_document_id and note.get("document_id") != filter_document_id:
            continue
        embedding = note.get("embedding")
        if not embedding:
            continue
        sim = get_similarity(query_embedding, embedding)
        if sim > match_threshold:
            matched_notes.append((sim, note))
            
    matched_notes.sort(key=lambda x: x[0], reverse=True)
    return [item[1] for item in matched_notes[:match_count]]
