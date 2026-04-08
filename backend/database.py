"""
JSON-based database module for AI Study Brain.
Handles CRUD operations for notes and question history.
"""

import json
import os
import uuid
from datetime import datetime
from pathlib import Path

DATA_DIR = Path(__file__).parent / "data"
NOTES_FILE = DATA_DIR / "notes.json"


def _ensure_data_file():
    """Ensure the data directory and file exist."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not NOTES_FILE.exists():
        with open(NOTES_FILE, "w") as f:
            json.dump({"notes": [], "history": []}, f)


def _read_db():
    """Read the entire database."""
    _ensure_data_file()
    with open(NOTES_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def _write_db(data):
    """Write the entire database."""
    _ensure_data_file()
    with open(NOTES_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


# ──────────────────────────── Notes CRUD ────────────────────────────


def get_all_notes():
    """Return all notes sorted by newest first."""
    db = _read_db()
    return sorted(db["notes"], key=lambda n: n["created_at"], reverse=True)


def search_notes(query: str):
    """Search notes by title or content (case-insensitive)."""
    query_lower = query.lower()
    notes = get_all_notes()
    return [
        n for n in notes
        if query_lower in n["title"].lower() or query_lower in n["content"].lower()
    ]


def get_note_by_id(note_id: str):
    """Get a single note by ID."""
    db = _read_db()
    for note in db["notes"]:
        if note["id"] == note_id:
            return note
    return None


def add_note(title: str, content: str, tags: list[str] | None = None):
    """Add a new note and return it."""
    db = _read_db()
    note = {
        "id": str(uuid.uuid4())[:8],
        "title": title.strip(),
        "content": content.strip(),
        "created_at": datetime.now().isoformat(),
        "tags": tags or [],
    }
    db["notes"].append(note)
    _write_db(db)
    return note


def delete_note(note_id: str):
    """Delete a note by ID. Returns True if found and deleted."""
    db = _read_db()
    original_len = len(db["notes"])
    db["notes"] = [n for n in db["notes"] if n["id"] != note_id]
    if len(db["notes"]) < original_len:
        _write_db(db)
        return True
    return False


# ──────────────────────────── History ────────────────────────────


def add_history_entry(question: str, answer: str, note_id: str | None = None):
    """Log a question/answer pair."""
    db = _read_db()
    entry = {
        "id": str(uuid.uuid4())[:8],
        "question": question,
        "answer": answer,
        "note_id": note_id,
        "asked_at": datetime.now().isoformat(),
    }
    db["history"].append(entry)
    # Keep only the last 50 entries
    db["history"] = db["history"][-50:]
    _write_db(db)
    return entry


def get_history():
    """Return question history, newest first."""
    db = _read_db()
    return sorted(db["history"], key=lambda h: h["asked_at"], reverse=True)
