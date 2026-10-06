# AI-SPEC — Phase 1: Backend Extraction & Core AI Service

> AI design contract for Phase 1. Consumed by `gsd-planner` and `gsd-eval-auditor`.
> Locks framework selection, implementation guidance, and evaluation strategy.

---

## 1. System Classification

**System Type:** Content Generation & Structured Recommendation

**Description:**
An AI game matchmaking engine that processes gamer preferences (genre, age rating, difficulty, and optional natural language prompts) and queries Google Gemini models to generate exactly 8 curated, well-known video game recommendations with rationale and tags.

**Critical Failure Modes:**
1. **Malformed Output**: Model outputs markdown wrappers or non-JSON text that fails JSON decoding.
2. **Cardinality Violation**: Model returns fewer or more than exactly 8 recommendations.
3. **Invalid/Hallucinated Games**: Recommendations invent fictional titles or mismatched ratings.
4. **Credential Leak**: Raw API keys or internal stack traces exposed to client responses.

---

## 1b. Domain Context

**Industry Vertical:** Gaming / Digital Entertainment  
**User Population:** Gamers seeking relevant game recommendations across multiple platforms  
**Stakes Level:** Low (entertainment recommendation)  
**Output Consequence:** User reviews recommendations, explores game pages, and saves matches to personal library  

---

## 2. Framework Decision

**Selected Framework:** LangChain (`langchain-google-genai`)

**Version:** `langchain-google-genai>=2.0.0`, `langchain-core>=0.3.0`

**Selection Rationale:**
The existing prototype in `Game_Finder.py` already implements and verifies a working prompt template (`prompt.json`) using LangChain's `load_prompt` and `GoogleGenerativeAI`. Using LangChain preserves that working prompt logic while migrating it cleanly to FastAPI.

---

## 3. Implementation Contract

**Model:** `gemini-1.5-flash` / `gemini-2.0-flash` (with configurable fallback)  
**Temperature:** 0.4 (low temperature for deterministic schema adherence and high relevance)  
**Max Retries:** 5 with exponential backoff on 503 / 429 errors  
**Output Format:** Strict JSON array of 8 objects:
```json
[
  {
    "name": "Game Title",
    "match_reason": "Clear explanation of why it fits the criteria",
    "attributes": ["tag1", "tag2"]
  }
]
```

**Sanitization Pipeline:**
1. Strip markdown fences (````json ... ````) if present in raw LLM text.
2. Parse JSON string into Python dict list.
3. Validate through Pydantic `GameRecommendation` model.
4. Enforce `len(recommendations) == 8`.

---

## 4. Evaluation Strategy

- **Automated Schema Compliance**: Unit tests verify that mocked responses adhere to the 8-item array contract.
- **Malformed Response Fallback**: Test verifies regex-based JSON extractor handles markdown-fenced responses without raising unhandled 500 errors.
