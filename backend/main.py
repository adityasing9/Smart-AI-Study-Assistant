"""
FastAPI backend for AI Study Brain.
Provides REST endpoints for notes management and AI question answering.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import database as db
import ai_engine
import rag_engine
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup - Sync notes into vector DB
    print("[Server Setup] Synchronizing notes to Vector DB...")
    notes = db.get_all_notes()
    rag_engine.sync_all_notes(notes)
    yield
    # Cleanup (if any)


# ──────────────────────────── App Setup ────────────────────────────

app = FastAPI(
    title="AI Study Brain API",
    description="Smart study assistant backend with TF-IDF & RAG capabilities",
    version="1.1.0",
    lifespan=lifespan
)

# CORS — allow the frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ──────────────────────────── Models ────────────────────────────


class NoteCreate(BaseModel):
    title: str
    content: str
    tags: list[str] | None = None


class QuestionRequest(BaseModel):
    question: str
    mode: str = "classic" # "classic" or "smart"


# ──────────────────────────── Endpoints ────────────────────────────


@app.get("/")
def root():
    return {"message": "AI Study Brain API is running 🧠"}


# ───── Notes ─────


@app.get("/api/notes")
def get_notes(q: str | None = None):
    """Fetch all notes, optionally filtered by search query."""
    if q:
        notes = db.search_notes(q)
    else:
        notes = db.get_all_notes()
    return {"notes": notes, "count": len(notes)}


@app.post("/api/notes")
def create_note(note: NoteCreate):
    """Add a new study note."""
    if not note.title.strip():
        raise HTTPException(status_code=400, detail="Title is required")
    if not note.content.strip():
        raise HTTPException(status_code=400, detail="Content is required")
    created = db.add_note(note.title, note.content, note.tags)
    
    # Update Vector Store
    rag_engine.add_note_to_vector_store(created)
    
    return {"note": created, "message": "Note created successfully"}


@app.delete("/api/notes/{note_id}")
def delete_note(note_id: str):
    """Delete a note by ID."""
    deleted = db.delete_note(note_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Note not found")
        
    # Update Vector Store
    rag_engine.delete_note_from_vector_store(note_id)
    
    return {"message": "Note deleted successfully"}


# ───── AI Question Answering ─────


@app.post("/api/ask")
def ask_question(req: QuestionRequest):
    """Process a question and return the best matching answer based on mode."""
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question is required")

    notes = db.get_all_notes()
    
    if req.mode == "smart":
        result = rag_engine.generate_smart_answer(req.question)
    else:
        result = ai_engine.find_best_answer(req.question, notes)

    # Save to history
    matched_id = result["matched_note"]["id"] if result["matched_note"] else None
    db.add_history_entry(req.question, result["answer"], matched_id)

    return {
        "question": req.question,
        "mode": req.mode,
        "answer": result["answer"],
        "matched_note": result["matched_note"],
        "keywords": result["keywords"],
        "related_notes": result["related_notes"],
    }


# ───── History ─────


@app.get("/api/history")
def get_history():
    """Fetch question history."""
    history = db.get_history()
    return {"history": history, "count": len(history)}


# ──────────────────────────── Run ────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
