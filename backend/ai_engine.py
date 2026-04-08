"""
AI Engine for AI Study Brain.
Handles keyword extraction, note matching, and answer generation.
Uses a TF-IDF-inspired scoring approach — no external AI libraries needed.
"""

import math
import re
from collections import Counter

# ──────────────────────────── Stop Words ────────────────────────────

STOP_WORDS = {
    "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "shall", "can", "need", "dare", "ought",
    "used", "to", "of", "in", "for", "on", "with", "at", "by", "from",
    "as", "into", "through", "during", "before", "after", "above", "below",
    "between", "out", "off", "over", "under", "again", "further", "then",
    "once", "here", "there", "when", "where", "why", "how", "all", "both",
    "each", "few", "more", "most", "other", "some", "such", "no", "nor",
    "not", "only", "own", "same", "so", "than", "too", "very", "just",
    "because", "but", "and", "or", "if", "while", "about", "up", "down",
    "what", "which", "who", "whom", "this", "that", "these", "those",
    "i", "me", "my", "myself", "we", "our", "you", "your", "he", "him",
    "his", "she", "her", "it", "its", "they", "them", "their", "am",
    "tell", "explain", "describe", "define", "give", "show", "know",
    "understand", "learn", "study", "please", "help", "question", "answer",
}

# ──────────────────────────── Keyword Extraction ────────────────────────────


def extract_keywords(text: str) -> list[str]:
    """
    Extract meaningful keywords from text.
    Removes stop words, punctuation, and short tokens.
    """
    # Normalize
    text = text.lower()
    # Remove punctuation except hyphens in words
    text = re.sub(r"[^\w\s-]", " ", text)
    # Tokenize
    tokens = text.split()
    # Filter stop words and short tokens
    keywords = [
        t for t in tokens
        if t not in STOP_WORDS and len(t) > 1
    ]
    return keywords


# ──────────────────────────── Scoring ────────────────────────────


def _compute_score(keywords: list[str], note: dict) -> float:
    """
    Score a note against the query keywords.
    Uses term frequency and field weighting (title > content > tags).
    """
    if not keywords:
        return 0.0

    title_lower = note["title"].lower()
    content_lower = note["content"].lower()
    tags_lower = " ".join(note.get("tags", [])).lower()

    score = 0.0

    for kw in keywords:
        # Title match (highest weight)
        title_hits = title_lower.count(kw)
        score += title_hits * 10.0

        # Content match
        content_hits = content_lower.count(kw)
        score += content_hits * 3.0

        # Tag match
        tag_hits = tags_lower.count(kw)
        score += tag_hits * 5.0

        # Exact phrase match bonus
        if kw in title_lower:
            score += 5.0

    # Normalize by number of keywords to avoid bias toward longer queries
    score /= len(keywords)

    # Length penalty: slightly prefer concise, focused notes
    content_len = len(content_lower.split())
    if content_len > 0:
        score *= math.log(content_len + 1) / math.log(content_len + 10)

    return round(score, 4)


# ──────────────────────────── Main API ────────────────────────────


def find_best_answer(question: str, notes: list[dict]) -> dict:
    """
    Given a question and all notes, return:
    - answer: the best matching note's content (or a fallback)
    - matched_note: the matched note dict (if any)
    - keywords: extracted keywords
    - related_notes: top 3 related notes
    - scores: all scores for debugging
    """
    keywords = extract_keywords(question)

    if not keywords:
        return {
            "answer": "I couldn't understand your question. Could you rephrase it with more specific terms?",
            "matched_note": None,
            "keywords": [],
            "related_notes": [],
        }

    if not notes:
        return {
            "answer": "You don't have any notes yet! Add some notes first, then I can help you find answers.",
            "matched_note": None,
            "keywords": keywords,
            "related_notes": [],
        }

    # Score all notes
    scored = []
    for note in notes:
        s = _compute_score(keywords, note)
        scored.append((s, note))

    # Sort by score descending
    scored.sort(key=lambda x: x[0], reverse=True)

    best_score, best_note = scored[0]

    if best_score < 0.5:
        return {
            "answer": f"I couldn't find a strong match for your question in your notes. Try adding notes about: {', '.join(keywords)}.",
            "matched_note": None,
            "keywords": keywords,
            "related_notes": [n for _, n in scored[:3] if _ > 0],
        }

    # Build highlighted answer
    answer = _highlight_answer(best_note["content"], keywords)

    # Related notes (exclude the best match)
    related = [n for s, n in scored[1:4] if s > 0]

    return {
        "answer": answer,
        "matched_note": best_note,
        "keywords": keywords,
        "related_notes": related,
    }


def _highlight_answer(content: str, keywords: list[str]) -> str:
    """
    Return the content with keyword positions marked for frontend highlighting.
    We use **keyword** markdown-style wrapping.
    """
    result = content
    for kw in sorted(keywords, key=len, reverse=True):
        # Case-insensitive replacement preserving original case
        pattern = re.compile(re.escape(kw), re.IGNORECASE)
        result = pattern.sub(lambda m: f"**{m.group(0)}**", result)
    return result
