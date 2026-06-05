"""
FastAPI backend for AI Study Brain.
Provides REST endpoints for notes management and AI question answering.
"""

from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

import database as db
import ai_engine
import rag_engine
import os
import jwt
from contextlib import asynccontextmanager
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_ANON_KEY", "")
JWT_SECRET = os.environ.get("SUPABASE_JWT_SECRET", "")

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
    version="1.2.0",
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
    document_id: str | None = None
    image_data: str | None = None


class AuthRequest(BaseModel):
    email: str
    password: str


# ──────────────────────────── Auth Helpers ────────────────────────────


def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    """Extract and verify user from JWT token in Authorization header."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    # Support both "Bearer <token>" and raw token
    token = authorization
    if authorization.startswith("Bearer "):
        token = authorization[7:]
    
    try:
        # Decode the Supabase JWT
        # Supabase uses the JWT_SECRET from project settings
        if JWT_SECRET:
            payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"], audience="authenticated")
        else:
            # Fallback: decode without verification (dev mode)
            payload = jwt.decode(token, options={"verify_signature": False})
        
        user_id = payload.get("sub")
        email = payload.get("email")
        
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token: no user ID")
        
        return {"id": user_id, "email": email}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")


def get_optional_user(authorization: Optional[str] = Header(None)) -> Optional[dict]:
    """Try to extract user from token, but don't fail if absent."""
    if not authorization:
        return None
    try:
        return get_current_user(authorization)
    except HTTPException:
        return None


# ──────────────────────────── Auth Endpoints ────────────────────────────


@app.get("/")
def root():
    return {"message": "AI Study Brain API is running 🧠"}


@app.post("/api/auth/signup")
def signup(req: AuthRequest):
    """Sign up a new user with email and password using Supabase Auth."""
    if not db.supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    
    try:
        result = db.supabase.auth.sign_up({
            "email": req.email,
            "password": req.password
        })
        
        if result.user is None:
            raise HTTPException(status_code=400, detail="Signup failed")
        
        # Return user info and session tokens
        return {
            "user": {
                "id": result.user.id,
                "email": result.user.email,
            },
            "access_token": result.session.access_token if result.session else None,
            "message": "Account created successfully"
        }
    except Exception as e:
        error_msg = str(e)
        if "already registered" in error_msg.lower() or "already been registered" in error_msg.lower():
            raise HTTPException(status_code=400, detail="This email is already registered. Please login instead.")
        raise HTTPException(status_code=400, detail=f"Signup failed: {error_msg}")


@app.post("/api/auth/login")
def login(req: AuthRequest):
    """Login with email and password using Supabase Auth."""
    if not db.supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    
    try:
        result = db.supabase.auth.sign_in_with_password({
            "email": req.email,
            "password": req.password
        })
        
        if result.user is None:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        return {
            "user": {
                "id": result.user.id,
                "email": result.user.email,
            },
            "access_token": result.session.access_token if result.session else None,
            "message": "Login successful"
        }
    except Exception as e:
        error_msg = str(e)
        if "invalid" in error_msg.lower() or "credentials" in error_msg.lower():
            raise HTTPException(status_code=401, detail="Invalid email or password")
        raise HTTPException(status_code=401, detail=f"Login failed: {error_msg}")


@app.get("/api/auth/me")
def get_me(user: dict = Depends(get_current_user)):
    """Get current user info from JWT token."""
    return {"user": user}


# ───── Notes & Documents ─────


@app.get("/api/notes")
def get_notes(q: str | None = None, user: dict = Depends(get_current_user)):
    """Fetch all notes, optionally filtered by search query."""
    user_id = user["id"]
    if q:
        notes = db.search_notes(q, user_id=user_id)
    else:
        notes = db.get_all_notes(user_id=user_id)
    return {"notes": notes, "count": len(notes)}


@app.get("/api/documents")
def get_documents(user: dict = Depends(get_current_user)):
    """Fetch unique documents."""
    docs = db.get_documents(user_id=user["id"])
    return {"documents": docs, "count": len(docs)}


@app.post("/api/notes")
def create_note(note: NoteCreate, user: dict = Depends(get_current_user)):
    """Add a new study note."""
    if not note.title.strip():
        raise HTTPException(status_code=400, detail="Title is required")
    if not note.content.strip():
        raise HTTPException(status_code=400, detail="Content is required")
    created = db.add_note(note.title, note.content, note.tags, user_id=user["id"])
    
    # Update Vector Store
    rag_engine.add_note_to_vector_store(created)
    
    return {"note": created, "message": "Note created successfully"}


@app.delete("/api/notes/{note_id}")
def delete_note(note_id: str, user: dict = Depends(get_current_user)):
    """Delete a note by ID."""
    deleted = db.delete_note(note_id, user_id=user["id"])
    if not deleted:
        raise HTTPException(status_code=404, detail="Note not found")
        
    # Update Vector Store
    rag_engine.delete_note_from_vector_store(note_id)
    
    return {"message": "Note deleted successfully"}


# ───── Document Upload ─────


@app.post("/api/upload")
@app.post("/api/upload-pdf")  # Alias for backward compatibility
async def upload_document(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    """Upload any document or image and extract its text into notes using MarkItDown."""
    try:
        from markitdown import MarkItDown
        import uuid
        import os
        import tempfile
        
        # Save the uploaded file to a temporary location
        suffix = os.path.splitext(file.filename)[1] if file.filename else ""
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name
        
        full_text = ""
        try:
            # Initialize MarkItDown and convert
            md = MarkItDown()
            result = md.convert(tmp_path)
            full_text = result.text_content or ""
            print(f"[Upload] MarkItDown extracted {len(full_text)} chars from {file.filename}")
        except Exception as convert_err:
            print(f"[Upload] MarkItDown failed for {file.filename}: {convert_err}")
        finally:
            # Always clean up the temporary file
            try:
                os.remove(tmp_path)
            except Exception:
                pass

        # Fallback: if markitdown returned nothing (or failed), decode directly for text files
        text_exts = {'.txt', '.md', '.csv', '.json', '.xml', '.html', '.htm', '.log',
                     '.py', '.js', '.ts', '.java', '.c', '.cpp', '.h', '.css',
                     '.yaml', '.yml', '.toml', '.ini', '.cfg', '.env'}
        if not full_text.strip() and suffix.lower() in text_exts:
            try:
                full_text = content.decode("utf-8", errors="ignore")
                print(f"[Upload] Fallback plain-text decode: {len(full_text)} chars")
            except Exception as decode_err:
                print(f"[Upload] Fallback decode failed: {decode_err}")
        
        if not full_text or not full_text.strip():
            # Give a helpful error based on file type
            image_exts = {'.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.svg'}
            if suffix.lower() in image_exts:
                raise HTTPException(
                    status_code=400, 
                    detail="Could not extract text from this image. Images without embedded text are not supported yet. Try uploading a document (PDF, Word, Excel, PowerPoint, or text file) instead."
                )
            raise HTTPException(status_code=400, detail="Could not extract any text from this file. Please try a different file format.")
        
        # Split into chunks of ~1500 chars for better note management
        chunks = []
        paragraphs = full_text.split("\n\n")
        current_chunk = ""
        
        for para in paragraphs:
            if len(current_chunk) + len(para) > 1500 and current_chunk:
                chunks.append(current_chunk.strip())
                current_chunk = para
            else:
                current_chunk += "\n\n" + para
        if current_chunk.strip():
            chunks.append(current_chunk.strip())
        
        # If no paragraph breaks, just split by size
        if not chunks:
            for i in range(0, len(full_text), 1500):
                chunks.append(full_text[i:i+1500].strip())
        
        # Create notes from chunks
        created_notes = []
        base_title = os.path.splitext(file.filename)[0] if file.filename else "Uploaded Document"
        document_id = f"doc_{str(uuid.uuid4())[:8]}"
        
        for i, chunk in enumerate(chunks):
            if not chunk.strip():
                continue
            title = f"{base_title} - Part {i+1}" if len(chunks) > 1 else base_title
            note = db.add_note(title, chunk, ["document-upload"], document_id=document_id, document_title=base_title, user_id=user["id"])
            rag_engine.add_note_to_vector_store(note)
            created_notes.append(note)
        
        if not created_notes:
            raise HTTPException(status_code=400, detail="The document was processed but no usable text was found.")
        
        return {
            "message": f"Document uploaded successfully. Created {len(created_notes)} note(s).",
            "notes": created_notes,
            "document_id": document_id,
            "count": len(created_notes)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process document: {str(e)}")


# ───── AI Question Answering ─────


@app.post("/api/ask")
def ask_question(req: QuestionRequest, user: dict = Depends(get_current_user)):
    """Process a question and return the best matching answer based on mode."""
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question is required")

    user_id = user["id"]
    notes = db.get_all_notes(user_id=user_id)
    
    if req.mode == "smart":
        result = rag_engine.generate_smart_answer(req.question, document_id=req.document_id, image_data=req.image_data, user_id=user_id)
    else:
        # Classic TF-IDF mode doesn't support document scoping yet, but we can filter the notes array
        if req.document_id:
            notes = [n for n in notes if n.get("document_id") == req.document_id]
            if not notes:
                return {
                    "question": req.question,
                    "mode": req.mode,
                    "answer": "No notes found for this document.",
                    "matched_note": None,
                    "keywords": [],
                    "related_notes": [],
                }
        result = ai_engine.find_best_answer(req.question, notes)

    # Save to history
    matched_id = result["matched_note"]["id"] if result["matched_note"] else None
    db.add_history_entry(req.question, result["answer"], matched_id, user_id=user_id)

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
def get_history(user: dict = Depends(get_current_user)):
    """Fetch question history."""
    history = db.get_history(user_id=user["id"])
    return {"history": history, "count": len(history)}




# ──────────────────────────── Run ────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
