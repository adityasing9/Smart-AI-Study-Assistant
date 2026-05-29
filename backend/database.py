import os
import uuid
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_ANON_KEY", "")

try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception as e:
    print(f"Supabase client failed to initialize: {e}")
    supabase = None

def get_all_notes():
    if not supabase: return []
    response = supabase.table("study_notes").select("*").execute()
    return response.data

def search_notes(query: str):
    if not supabase: return []
    response = supabase.table("study_notes").select("*").ilike("content", f"%{query}%").execute()
    return response.data

def add_note(title, content, tags=None, document_id=None, document_title=None):
    if tags is None:
        tags = []
    
    note = {
        "id": str(uuid.uuid4())[:8],
        "title": title,
        "content": content,
        "tags": tags,
        "document_id": document_id,
        "document_title": document_title
    }
    
    if supabase:
        supabase.table("study_notes").insert(note).execute()
    return note

def update_note_embedding(note_id: str, embedding: list):
    if supabase:
        supabase.table("study_notes").update({"embedding": embedding}).eq("id", note_id).execute()

def delete_note(note_id):
    if supabase:
        supabase.table("study_notes").delete().eq("id", note_id).execute()
    return True

def get_history():
    if not supabase: return []
    response = supabase.table("ask_history").select("*").order("asked_at", desc=True).execute()
    return response.data

def add_history_entry(question, answer, matched_note_id=None):
    entry = {
        "id": str(uuid.uuid4())[:8],
        "question": question,
        "answer": answer,
        "matched_note_id": matched_note_id
    }
    if supabase:
        supabase.table("ask_history").insert(entry).execute()

def get_documents():
    if not supabase: return []
    response = supabase.table("study_notes").select("document_id, document_title").not_.is_("document_id", "null").execute()
    
    # Deduplicate
    docs = {}
    for note in response.data:
        docs[note["document_id"]] = note["document_title"]
        
    return [{"document_id": k, "document_title": v} for k, v in docs.items()]

def match_study_notes(query_embedding: list, match_threshold: float = 0.5, match_count: int = 3, filter_document_id: str = None):
    if not supabase: return []
    
    params = {
        "query_embedding": query_embedding,
        "match_threshold": match_threshold,
        "match_count": match_count
    }
    if filter_document_id:
        params["filter_document_id"] = filter_document_id
        
    response = supabase.rpc("match_study_notes", params).execute()
    return response.data
