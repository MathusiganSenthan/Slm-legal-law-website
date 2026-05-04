# Sri Lankan Legal AI Platform

An AI-powered legal services platform for Sri Lanka, built as a collection of specialized micro-applications. The system combines fine-tuned Small Language Models (SLMs), Retrieval-Augmented Generation (RAG), LangGraph agentic workflows, and domain-specific validation agents to provide intelligent assistance across four areas of Sri Lankan law.

---

## Table of Contents

- [Project Overview](#project-overview)
- [System Architecture](#system-architecture)
- [Services](#services)
  - [Common Gateway](#1-common-gateway)
  - [Criminal Judgement Predictor](#2-criminal-judgement-predictor)
  - [Deed Validation](#3-deed-validation)
  - [Labour Law Recommendation](#4-labour-law-recommendation)
  - [Law Q&A](#5-law-qa)
- [Frontend Applications](#frontend-applications)
- [AI/ML Pipeline](#aiml-pipeline)
- [Tech Stack](#tech-stack)
- [Port Reference](#port-reference)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)

---

## Project Overview

The platform is structured as a set of independent microservices, each targeting a specific domain of Sri Lankan law, all unified through a central authentication gateway and a shared portal frontend.

| Domain | Backend Service | Frontend App | AI Technique |
|---|---|---|---|
| Authentication & Routing | Common Gateway | Common Portal | — |
| Criminal Law | Criminal Judgement | criminal-judgement | Fine-tuned BERT |
| Property Law (Deeds) | Deed Validation | deed-validation-law | Qwen3-8B + LangGraph |
| Labour & Employment Law | Labour Law Recommendation | labour-law-recommendation | Qwen3-8B + FAISS RAG |
| Property & Family Law Q&A | Law Q&A (3 variants) | law-QA | LangGraph Agentic RAG |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Frontend (React / Vite)                          │
│                                                                         │
│  Common Portal    Criminal     Deed Validation  Labour Law    Law QA   │
│  :3000            :3001        :3002            :3003         :3004    │
└────────────────────────────┬────────────────────────────────────────────┘
                             │ HTTP + HTTP-only JWT Cookies
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                   Common Gateway  :4000                                 │
│                                                                         │
│  • JWT auth  (register / login / refresh / logout)                      │
│  • Role-based access  (user / admin)                                    │
│  • Audit logging (every request → PostgreSQL)                           │
│  • Reverse proxy → downstream services                                  │
│  • Injects X-User-Id / X-User-Email / X-User-Role headers              │
└──────┬──────────────┬────────────┬─────────────┬──────────────┬─────────┘
       │              │            │             │              │
       ▼              ▼            ▼             ▼              ▼
  Criminal       Deed Valid.   Labour Law    Law QA        Law QA
  :8001          :8004         :8005         Basic:8000    RAG:8002
                                             Agentic:8003
       │              │            │             │
       ▼              ▼            ▼             ▼
  PostgreSQL    PostgreSQL    PostgreSQL    PostgreSQL
  (bookmarks)  (history)     (queries)     (sessions)
                    │            │             │
                    ▼            ▼             ▼
               FAISS            FAISS         FAISS
               (embeddings)    (labour docs) (legal docs)
                    │            │             │
                    ▼            ▼             ▼
              Qwen3-8B         Qwen3-8B       Qwen3 SLM
              (Ollama /        (Ollama /      (Ollama /
               Modal.com)       Modal.com)     Modal.com)
```

### Data & Model Pipeline

```
Unstructured Data (PDFs, legal texts)
        │
        ├──── Fine-tuning Path ─────────────────────────────────────────────►
        │     Extract → Structure (JSON) → Train/Valid/Test split
        │     → Unsloth Framework + QWEN 3 (4B / 1.7B / 0.5B) → Fine-tuned SLM
        │     → Save to DB / Ollama
        │
        └──── RAG Path ─────────────────────────────────────────────────────►
              Extract → Chunk → Embedding Model
              → Postgres + Vector DB (FAISS)
              → Hybrid Search (Semantic + BM25) at query time
              → Top-10 context chunks → Fine-tuned SLM → Output
```

---

## Services

### 1. Common Gateway

**Path:** `legal_ai_backend/common-gateway/` | **Port:** `4000`

Central authentication hub and reverse proxy for the entire platform. All frontend requests are routed through here.

**Key Responsibilities:**
- User registration and login with bcrypt-hashed passwords
- JWT-based auth via HTTP-only cookies (access: 60 min, refresh: 7 days)
- Role-based access control (`user` / `admin`)
- Automatic audit logging of every API call
- Reverse-proxying authenticated requests to downstream services with injected user identity headers

**API Endpoints:**

| Method | Path | Description |
|---|---|---|
| `POST` | `/auth/register` | Create new user account |
| `POST` | `/auth/login` | Login, receive JWT cookies |
| `POST` | `/auth/refresh` | Refresh access token |
| `POST` | `/auth/logout` | Clear auth cookies |
| `GET` | `/auth/me` | Current user info |
| `GET/PUT` | `/users/me` | View/update profile |
| `GET` | `/admin/users` | List all users (admin) |
| `GET` | `/admin/audit-log` | Filtered audit log (admin) |
| `GET` | `/admin/stats` | Platform statistics (admin) |
| `*` | `/api/criminal/*` | Proxy → Criminal Judgement `:8001` |
| `*` | `/api/deed/*` | Proxy → Deed Validation `:8004` |
| `*` | `/api/labour/*` | Proxy → Labour Law `:5005` |
| `*` | `/api/law-qa/*` | Proxy → Law QA Basic `:8000` |
| `*` | `/api/law-qa-rag/*` | Proxy → Law QA RAG `:8002` |
| `*` | `/api/law-qa-agentic/*` | Proxy → Law QA Agentic `:8003` |

**Data Models:** `User` (UUID, email, username, role, is_active), `AuditLog` (user_id, action, service, endpoint, ip_address)

---

### 2. Criminal Judgement Predictor

**Path:** `legal_ai_backend/criminal-judgement/` | **Port:** `8001`

Predicts the likely outcome of a Sri Lankan criminal court case given structured case details, retrieves similar precedent cases, and generates a downloadable PDF report.

**AI/ML Pipeline:**

```
Case Details Form
  → PromptBuilder.build()               → Structured text
  → BERT Tokenizer (max_length=512)     → Token IDs
  → Fine-tuned BertForSequenceClassification (25 classes)
  → softmax + argmax                    → Verdict label + confidence
  → SentenceTransformer (MiniLM-L6-v2) → Cosine similarity search
  → rag_cases.pt (pre-computed embeddings) → Top-3 similar precedents
  → Rule-based discussion builder       → Narrative explanation
  → fpdf                                → Downloadable PDF report
```

**25 Judgment Classes** include: Guilty, Not Guilty, Guilty (Lesser Offence), Guilty (Sentence Reduced), Guilty (Plea), Acquitted, Retrial Required, Judgment Nullified, and more.

**API Endpoints:**

| Method | Path | Description |
|---|---|---|
| `POST` | `/predict` | Predict judgment outcome |
| `GET` | `/download_pdf/{filename}` | Download generated PDF |
| `POST/GET` | `/bookmarks` | Save / list prediction bookmarks |
| `DELETE` | `/bookmarks/{id}` | Delete bookmark |

**Input Fields:** `OffenceCategory`, `PenalCodeSection`, `WeaponUsed`, `Intent`, `PriorRecord`, `EvidenceType`, `FactsSummary`

---

### 3. Deed Validation

**Path:** `legal_ai_backend/deed-validation-law/` | **Port:** `8004`

Validates Sri Lankan property deed documents (PDF, image, or text) for legal compliance. Classifies the deed type using fine-tuned Qwen3-8B, then runs type-specific validation agents checking all requirements under Ceylon/Sri Lankan land law.

**LangGraph Workflow:**

```
Input (text / file / base64)
  → extract_text node (PyMuPDF → GCP Vision → Tesseract)
  → classify_deed node (Qwen3-8B via PEFT/LoRA)
       ├── Not a deed → format_output
       └── Deed identified → validate_deed node (Qwen3-8B agent per deed type)
                                  → format_output
```

**Supported Deed Types:**

| Deed Type | Key Legal Checks |
|---|---|
| Power of Attorney | Principal/attorney identity, scope, irrevocability, attestation (2 witnesses + notary) |
| Deed of Transfer | Parties, consideration, property description, title chain, execution |
| Deed of Gift | Donor/donee, voluntary nature, property description, attestation |
| Mortgage Deed | Loan amount, interest rate, repayment terms, security clause |
| Testamentary Deed | Testator capacity, beneficiaries, execution, witness requirements |

**API Endpoints:**

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/v1/validate/text` | Validate plain text deed |
| `POST` | `/api/v1/validate/file` | Validate uploaded PDF / image |
| `POST` | `/api/v1/validate/base64` | Validate base64-encoded document |

**Response Includes:** `classification` (deed type, confidence), `validation` (score 0–100, grade A–F, issues with severity/legal_reference), `extracted_data` (parties, property, consideration, witnesses), `processing_metadata`.

---

### 4. Labour Law Recommendation

**Path:** `legal_ai_backend/labour-law-recommendation/` | **Port:** `5005`

RAG-based Q&A and recommendation system for Sri Lankan Labour & Employment Law. Answers questions about worker rights, dismissals, wages, EPF/ETF, trade unions, etc., citing relevant law sections and cases from a managed document corpus.

**Architecture:** Two-server split:
- **Main Server (`:5005`):** FastAPI — handles embedding, FAISS search, reranking, context assembly, response parsing, and PostgreSQL persistence.
- **Model Server:** Fine-tuned Qwen3-8B, served via Ollama. Runs locally or deployed to **Modal.com** (A10G GPU); a transparent proxy server (`:5007`) tunnels to Modal when cloud mode is active.

**Recommendation Pipeline:**

```
User query
  → Out-of-scope guard (regex pre-filter: rejects casual/non-legal queries)
  → Embedding: Gemini embedding-001 (primary) / MiniLM (fallback)
  → FAISS search (top_k × 3, min_sim=0.20) → Wide candidate set
  → Document-diverse reranking (distributes results across source documents)
  → Context assembly → Qwen3-8B (Ollama / Modal.com)
  → Structured JSON output → PostgreSQL
```

**Output Schema:** `summary` (verdict + key_points), `primary_violation` (law, section, penalty), `supporting_cases`, `recommendations`, `disclaimer`.

**API Endpoints:**

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/query/recommend` | Main recommendation pipeline |
| `GET` | `/api/query/history` | Paginated query history |
| `POST` | `/api/query/{id}/feedback` | User feedback (upvote/downvote) |
| `POST/GET` | `/api/admin/documents` | Upload / list RAG corpus documents |
| `DELETE` | `/api/admin/documents/{id}` | Remove document + embeddings |

---

### 5. Law Q&A

**Path:** `legal_ai_backend/law-qa/` | **Ports:** `8000` (basic), `8002` (RAG), `8003` (Agentic RAG)

Three progressively sophisticated Q&A backends for Sri Lankan Property Law and Family Law, sharing the same frontend API contract.

#### 5a. Basic Backend (`:8000`)
Direct conversational Q&A — query goes straight to the LLM with conversation history for context. No retrieval.

#### 5b. RAG Backend (`:8002`)
Adds FAISS-based document retrieval. Retrieves relevant chunks from a legal document corpus before generating an answer, enabling source citations.

```
Query → FAISS vector search (top_k=5, threshold=0.3)
      → Retrieved chunks → context string
      → LLM (Qwen3 via Modal Ollama) with context + query
      → Response with source_documents and citations
```

#### 5c. Agentic RAG Backend (`:8003`)
Most sophisticated variant. Combines LangGraph orchestration with RAG — adaptively decides whether to retrieve, rewrites the query if retrieved documents are low-quality, and validates the final response.

**LangGraph Flow:**

```
START → ROUTER
  ├── needs_retrieval=True  → RETRIEVER → GRADER
  │                                           ├── relevant → GENERATOR → VALIDATOR → END
  │                                           └── not relevant → REWRITER → RETRIEVER (max 2 retries)
  └── needs_retrieval=False → GENERATOR → VALIDATOR → END
                                               └── invalid → retry GENERATOR (max 2)
```

---

## Frontend Applications

All frontend apps are standalone Vite + React + TypeScript projects. The Common Portal acts as the launch hub; users navigate to specialized micro-apps via `window.location.href`.

### Common Portal (`:3000`)

Central login/register and navigation hub. Manages HTTP-only cookie auth with a token refresh interceptor and queue (handles parallel 401s). Provides live service health badges, platform statistics, admin panel (user management, audit log).

**Pages:** `/login`, `/register`, `/dashboard`, `/profile`, `/admin/users`, `/admin/health`, `/admin/audit-log`

### Criminal Judgement UI (`:3001`)

Case form with offence category autocomplete, penal code multi-select (filtered by category), intent/evidence selectors. Displays verdict in an SVG confidence ring (color-coded), numbered discussion sections, similar-cases table, and exports a full A4 jsPDF report.

**Pages:** `/` (analysis form + result), `/bookmarks`, `/bookmarks/:id`

### Deed Validation UI (`:3002`)

Drag-and-drop document uploader (PDF/image, 25 MB cap) with Framer Motion animated progress. Results page shows grade (A–F, color-coded), score, severity-grouped issues (critical / warning / info), extracted parties and property data. Full-screen pdfjs document viewer with annotation pins mapping validation issues to document positions.

**Pages:** `/` (upload), `/history`, `/result/:id`, `/result/:id/document`, `/analytics`, `/help`, `/settings`

### Labour Law UI (`:3003`)

Query textarea (2000 char limit, min 10 chars) with four example query chips. Results display primary violations (act, section, relevance), supporting cases table, recommended actions, confidence ring. History sidebar groups past queries with pin/remove support. Admin section manages RAG document corpus, FAISS index status, and query statistics.

**Pages:** `/` (query + result), `/history`, `/admin`, `/admin/documents`, `/admin/health`, `/admin/settings`

### Law QA UI (`:3004`)

Conversational interface with a topic selector (Agentic RAG / Agent only / RAG only) that routes to the correct backend. Shows reasoning trace steps, retrieved sources/citations, applicable laws, and performance metrics. Merges history from all three backends into a single timeline.

**Pages:** `/` (query), `/response/:id`, `/rag/response/:id`, `/agentic-rag/response/:id`, and corresponding history pages.

---

## AI/ML Pipeline

### Fine-Tuning

```
Sri Lankan Legal Corpus (PDFs, case reports, statutes)
  → Structured JSON datasets
  → Train / Validation / Test split
  → Unsloth fine-tuning framework
  → Base models: QWEN 3 (4B, 1.7B, 0.5B), BERT (criminal judgement)
  → PEFT / LoRA adapters
  → Saved to Ollama (GGUF) or HuggingFace checkpoints
```

### RAG (Retrieval-Augmented Generation)

```
Document corpus → Extract → Chunk (512 tokens, 50 overlap)
               → Embedding Model (Gemini / MiniLM)
               → FAISS flat index + PostgreSQL metadata

Query → Embed query → FAISS search → Hybrid reranking (Semantic + BM25)
      → Top-10 context chunks → Fine-tuned SLM → Structured output
```

### Agentic Orchestration (LangGraph)

- **Deed Validation:** `extract_text → classify_deed → validate_deed → format_output`
- **Law QA Agentic RAG:** `router → retriever → grader → (rewriter loop) → generator → validator`

---

## Tech Stack

### Backend

| Layer | Technology |
|---|---|
| API Framework | FastAPI + Uvicorn |
| Language | Python 3.10+ |
| Database | PostgreSQL (async SQLAlchemy + asyncpg) |
| Authentication | JWT HS256, bcrypt (passlib), HTTP-only cookies |
| HTTP Proxy | httpx (async) |
| Vector Search | FAISS (in-memory flat index) |
| Embeddings | Gemini `embedding-001`, `sentence-transformers/all-MiniLM-L6-v2` |
| LLM Serving | Ollama (local) / Modal.com serverless GPU (A10G) |
| Fine-tuned Models | BERT (criminal), Qwen3-8B (deed classifier, labour + law QA) |
| LLM Orchestration | LangGraph (StateGraph) |
| OCR | PyMuPDF, Google Cloud Vision, Gemini Vision, Tesseract |
| PDF Generation | fpdf |
| Config | pydantic-settings |
| Fine-tuning Tools | Unsloth, PEFT / LoRA, HuggingFace Transformers |
| Cloud GPU | Modal.com |

### Frontend

| Layer | Technology |
|---|---|
| Framework | React 19 (React 18 for law-QA) |
| Language | TypeScript ~5.9 |
| Build | Vite 7 + SWC (Vite 5 for law-QA) |
| Routing | React Router DOM v7 (v6 for law-QA) |
| Styling | Tailwind CSS v4 (v3 for law-QA) |
| Server State | TanStack React Query v5 |
| HTTP | Axios / native fetch |
| Schema Validation | Zod |
| Animations | Framer Motion |
| PDF Export | jsPDF + jspdf-autotable |
| PDF Rendering | pdfjs-dist |
| Charts | Recharts |
| Icons | Lucide React |
| Notifications | react-hot-toast |

---

## Port Reference

| Service | Port |
|---|---|
| Common Portal (frontend) | 3000 |
| Criminal Judgement (frontend) | 3001 |
| Deed Validation (frontend) | 3002 |
| Labour Law (frontend) | 3003 |
| Law QA (frontend) | 3004 |
| Common Gateway (backend) | 4000 |
| Labour Law Main Server | 5005 |
| Labour Law Model Proxy | 5007 |
| Law QA Basic | 8000 |
| Criminal Judgement | 8001 |
| Law QA RAG | 8002 |
| Law QA Agentic RAG | 8003 |
| Deed Validation | 8004 |

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 20+
- PostgreSQL 15+
- [Ollama](https://ollama.ai) (for local LLM serving)
- (Optional) Modal.com account (for cloud GPU model serving)

### Backend Setup

```bash
# 1. Common Gateway
cd legal_ai_backend/common-gateway
pip install -r requirements.txt
cp .env.example .env   # fill in DB credentials and JWT secret
uvicorn src.main:app --port 4000 --reload

# 2. Criminal Judgement
cd legal_ai_backend/criminal-judgement
pip install -r requirements.txt
uvicorn api:app --port 8001 --reload

# 3. Deed Validation
cd legal_ai_backend/deed-validation-law
pip install -r requirements.txt
cp .env.example .env   # fill in model configuration
uvicorn api.main:app --port 8004 --reload

# 4. Labour Law
cd legal_ai_backend/labour-law-recommendation/main-server
pip install -r requirements.txt
uvicorn main:app --port 5005 --reload

# 5. Law QA (run all three or as needed)
cd legal_ai_backend/law-qa/backend
uvicorn main:app --port 8000 --reload

cd legal_ai_backend/law-qa/backend_rag
uvicorn main:app --port 8002 --reload

cd legal_ai_backend/law-qa/backend_agentic_rag
uvicorn main:app --port 8003 --reload
```

### Frontend Setup

```bash
# Install and start each frontend app
cd legal_ai_frontend/common-portal && npm install && npm run dev        # :3000
cd legal_ai_frontend/criminal-judgement && npm install && npm run dev   # :3001
cd legal_ai_frontend/deed-validation-law && npm install && npm run dev  # :3002
cd legal_ai_frontend/labour-law-recommendation && npm install && npm run dev  # :3003
cd legal_ai_frontend/law-QA && npm install && npm run dev               # :3004
```

---

## Environment Variables

### Common Gateway (`.env`)

```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/legal_ai
SECRET_KEY=your-jwt-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7
```

### Deed Validation (`.env`)

```env
OLLAMA_BASE_URL=http://localhost:11434
HF_MODEL_PATH=path/to/qwen3-8b-deed-classifier
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/deed_db
```

### Labour Law Main Server (`.env`)

```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/labour_db
GEMINI_API_KEY=your-gemini-api-key
OLLAMA_BASE_URL=http://localhost:11434
MODAL_TOKEN_ID=your-modal-token        # if using Modal.com
MODAL_TOKEN_SECRET=your-modal-secret
```

### Frontend (`.env` per app)

```env
VITE_API_BASE_URL=http://localhost:4000        # common-portal
VITE_API_URL=http://localhost:8004/api/v1      # deed-validation-law
VITE_API_BASE_URL=http://localhost:5005        # labour-law-recommendation
```

---

## Research Component

The `Research_small_LM/` directory contains research notebooks and experiments for fine-tuning Small Language Models (SLMs) on Sri Lankan legal corpora using the Unsloth framework with QWEN 3 base models (4B, 1.7B, 0.5B parameters). Results from these experiments are deployed as the backend model servers.
