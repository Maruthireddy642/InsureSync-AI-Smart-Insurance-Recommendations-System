<div align="center">

# 🛡️ InsureSync AI
### Smart Insurance Recommendations System

An AI-powered healthcare workflow automation and insurance advisory platform. InsureSync AI combines machine-learning risk classification, a multi-factor **Insurance Recommendation Score (IRS)** engine, real-time WebSocket event streaming, and role-based access control to deliver hyper-personalized insurance plan matching with seamless claims and prior-authorization tracking.

[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-Build%20Tool-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-Academic%20Use-lightgrey)](#-license--academic-note)

</div>

---

## 📋 Table of Contents

1. [Overview & Highlights](#-overview--highlights)
2. [Core Architecture](#-core-architecture)
3. [Technology Stack](#-technology-stack)
4. [Insurance Recommendation Score (IRS) Formula](#-insurance-recommendation-score-irs-formula)
5. [Project Directory Structure](#-project-directory-structure)
6. [Prerequisites](#-prerequisites)
7. [Getting Started](#-getting-started)
   - [Method 1: Quick Launch (Windows)](#method-1-quick-launch-automated-scripts--windows)
   - [Method 2: Manual Setup](#method-2-manual-step-by-step-setup)
8. [Demo Credentials](#-demo-credentials)
9. [Key Application Workflows](#-key-application-workflows)
10. [API Documentation](#-api-documentation)
11. [Configuration & Environment Variables](#-configuration--environment-variables)
12. [Troubleshooting & FAQs](#-troubleshooting--faqs)
13. [Screenshots](#-screenshots)
14. [License & Academic Note](#-license--academic-note)

---

## 🌟 Overview & Highlights

| | |
|---|---|
| 🎯 **Personalized Matching** | Evaluates health metrics, lifestyle habits, and budget against policies to compute tailored recommendation scores. |
| 🤖 **ML Risk Classification** | Scikit-learn models analyze vital parameters to predict risk levels for diabetes, hypertension, and cardiovascular disease. |
| ⚡ **Real-Time Updates** | Dual-channel WebSocket architecture instantly syncs claim submissions, approvals, and status transitions. |
| 🔒 **Role-Based Access Control** | Dedicated views and secured endpoints for **Customers**, **Providers**, and **Administrators**. |
| 💬 **Hybrid AI Advisor** | OpenAI GPT advisory with an offline, rule-based fallback — works out of the box with no external API key required. |
| 🗄️ **Resilient Storage** | SQLite by default with an instant PostgreSQL switch; MongoDB with automatic local-disk document fallback. |

---

## 🏛️ Core Architecture

```
                                  ┌───────────────────────────┐
                                  │   React + Vite Frontend   │
                                  │  (Customer/Provider/Admin)│
                                  └─────────────┬─────────────┘
                                                │ REST / WebSocket
                                                ▼
                                  ┌───────────────────────────┐
                                  │   FastAPI Backend Server  │
                                  └──────┬──────────┬─────────┘
                                         │          │
                 ┌───────────────────────┼──────────┴────────────────────────┐
                 ▼                       ▼                                   ▼
        ┌────────────────┐      ┌─────────────────┐                ┌──────────────────┐
        │   ML Engine    │      │   IRS Engine    │                │ Real-Time WS Hub │
        │ (Risk Models)  │      │ (Multi-Factor)  │                │  (Status Alerts) │
        └────────────────┘      └─────────────────┘                └──────────────────┘
                 │                       │                                   │
                 └───────────────────────┼───────────────────────────────────┘
                                         ▼
                     ┌───────────────────────────────────────┐
                     │           Persistence Layer           │
                     │  • SQLite / PostgreSQL (Structured)   │
                     │  • MongoDB / JSON Store (Documents)   │
                     └───────────────────────────────────────┘
```

---

## 💻 Technology Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend Framework** | React 18 + Vite | High-performance single-page application (SPA) |
| **Styling & Icons** | Tailwind CSS + Lucide React | Modern, responsive UI with clean data visualizations |
| **Data Visualization** | Recharts | Interactive charts for claims, risk metrics, and analytics |
| **Backend API** | Python FastAPI | Asynchronous RESTful API & WebSocket manager |
| **Machine Learning** | Scikit-learn, NumPy, Joblib | Logistic-regression health-risk predictive models |
| **Authentication** | JWT (python-jose) + Passlib / Bcrypt | Secure token-based auth with granular role permissions |
| **Relational Database** | SQLAlchemy (SQLite / PostgreSQL) | Strongly typed ORM schema management and seeding |
| **Document Store** | PyMongo / Local-disk fallback | Medical document and claims attachment storage |
| **AI Advisor** | OpenAI API (with rule-engine fallback) | Context-aware policy and insurance chatbot |

---

## 📐 Insurance Recommendation Score (IRS) Formula

InsureSync AI implements a custom multi-factor ranking algorithm:

$$\mathbf{IRS} = (w_1 \times \text{CPF}) + (w_2 \times \text{BMS}) + (w_3 \times \text{CRS}) - (w_4 \times \text{PMC})$$

| Component | Term Name | Description | Weight |
|---|---|---|---|
| **CPF** | Coverage Fit Score | Evaluates policy coverage limits & deductibles against ML-predicted health risk | $w_1 = 0.35$ |
| **BMS** | Benefits Matching Score | Jaccard overlap between the customer's requested perks and policy offerings | $w_2 = 0.25$ |
| **CRS** | Claim Reliability Score | Insurer's historical approval percentage and average processing turnaround | $w_3 = 0.25$ |
| **PMC** | Premium Cost Factor | Relative penalty applied when the monthly premium exceeds the customer's budget | $w_4 = 0.15$ |

> Weights can be customized directly in `backend/app/services/irs_engine.py`.

---

## 📂 Project Directory Structure

```text
InsureSync-AI-Smart-Insurance-Recommendations-System/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application entry & middleware
│   │   ├── config.py            # Environment-driven app settings
│   │   ├── database.py          # SQLAlchemy engine & DB session setup
│   │   ├── seed.py              # Database seeder (demo users, policies, claims)
│   │   ├── core/                # JWT security, RBAC guards, WebSocket hub
│   │   ├── models/               # SQLAlchemy database models
│   │   ├── schemas/              # Pydantic validation models
│   │   ├── services/             # IRS engine, ML risk services, LLM advisor, analytics
│   │   ├── routers/               # API routers (auth, users, policies, recommendations, etc.)
│   │   └── ml/                   # Synthetic training datasets & model pipelines
│   ├── requirements.txt         # Python dependencies
│   ├── .env.example              # Example environment variables
│   └── insuresync.db             # Default SQLite database
├── frontend/
│   ├── src/
│   │   ├── pages/                # Login, Register, Role Dashboards, Advisor, Workflow
│   │   ├── components/           # Reusable UI cards, badges, navigation, IRS ledger
│   │   ├── context/               # AuthContext state management
│   │   ├── api/                   # Axios HTTP client & endpoints
│   │   └── App.jsx                # Routing & application root
│   ├── index.html                # Frontend HTML root
│   ├── package.json              # NPM dependencies & scripts
│   ├── tailwind.config.js        # Tailwind CSS configuration
│   └── vite.config.js            # Vite development & build configuration
├── run.bat                       # Windows Batch one-click launcher
├── run.ps1                       # Windows PowerShell one-click launcher
└── README.md                     # Project documentation
```

---

## ⚙️ Prerequisites

Make sure the following tools are installed on your machine:

| Tool | Version | Link |
|---|---|---|
| Python | 3.10+ | [Download](https://www.python.org/downloads/) |
| Node.js | 18.x+ | [Download](https://nodejs.org/) |
| npm | Bundled with Node.js | — |
| Git *(optional)* | Latest | [Download](https://git-scm.com/) |

---

## 🚀 Getting Started

### Method 1: Quick Launch (Automated Scripts — Windows)

Launch both the backend and frontend servers simultaneously using the provided scripts.

**PowerShell:**
```powershell
.\run.ps1
```
> If you hit execution-policy restrictions, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` first.

**Command Prompt / Double-click:**
```cmd
run.bat
```

Both servers start in separate terminal windows, and your default browser opens to `http://localhost:5173`.

---

### Method 2: Manual Step-by-Step Setup

#### Step 1 — Backend Setup (FastAPI)

**1.1 Navigate to the backend directory:**
```bash
cd backend
```

**1.2 Create and activate a Python virtual environment:**

| OS | Command |
|---|---|
| Windows (PowerShell) | `python -m venv venv` then `.\venv\Scripts\Activate.ps1` |
| Windows (CMD) | `python -m venv venv` then `venv\Scripts\activate.bat` |
| macOS / Linux | `python3 -m venv venv` then `source venv/bin/activate` |

**1.3 Install dependencies:**
```bash
pip install -r requirements.txt
```

**1.4 Configure environment variables:**

| OS | Command |
|---|---|
| Windows | `copy .env.example .env` |
| macOS / Linux | `cp .env.example .env` |

**1.5 Seed the database** (creates the SQLite DB, demo users, and catalog):
```bash
python -m app.seed
```

**1.6 Start the FastAPI server:**
```bash
python -m uvicorn app.main:app --reload --port 8000
```
✅ Backend running at **`http://localhost:8000`**
📑 Interactive API docs at **`http://localhost:8000/docs`**

---

#### Step 2 — Frontend Setup (React + Vite)

**2.1 Navigate to the frontend directory:**
```bash
cd frontend
```

**2.2 Install dependencies:**
```bash
npm install
```

**2.3 Start the development server:**
```bash
npm run dev
```
✅ Frontend live at **`http://localhost:5173`**

---

## 👥 Demo Credentials

The database seeder automatically initializes three demo accounts, each with a distinct RBAC role.

| Role | Email | Password | Primary Capabilities |
|---|---|---|---|
| **Customer** | `customer@insuresync.ai` | `password123` | Complete health profile, view ML risk assessment, check IRS recommendations, submit claims & prior-auths |
| **Provider** | `provider@insuresync.ai` | `password123` | Review claims queue and prior-authorization requests, approve/reject/update claim lifecycles |
| **Administrator** | `admin@insuresync.ai` | `password123` | Access platform analytics, review IRS breakdowns, monitor user engagement |

> You can also register a new account from the registration page.

---

## 🔄 Key Application Workflows

1. **Customer Health & Recommendations**
   - Log in as a Customer.
   - Complete medical vitals (blood pressure, BMI, glucose, smoking status, pre-existing conditions).
   - The system runs Scikit-learn risk inference and displays risk percentages.
   - View the **Recommendations** tab for the IRS-ranked policy catalog with interactive score breakdowns.

2. **Claims & Prior-Authorization Lifecycle**
   - As a Customer, submit a claim or prior-authorization request.
   - Log in from another browser window as a Provider (`provider@insuresync.ai`).
   - Transition claim status (`Submitted` → `Under Review` → `Approved` → `Paid`).
   - The customer's dashboard updates in real time via WebSocket, with no refresh required.

3. **AI Insurance Advisor**
   - Open the AI Advisor from any view to ask natural-language questions about deductibles, out-of-pocket limits, policy terms, and claims assistance.

4. **Administrative Analytics**
   - Log in as Admin to analyze platform-wide metrics, policy performance, and claim resolution distributions.

---

## 📚 API Documentation

FastAPI provides automated interactive API documentation:

- **Swagger UI:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc:** [http://localhost:8000/redoc](http://localhost:8000/redoc)

### Key Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Authenticate and receive a JWT access token |
| `GET` | `/api/policies/` | Retrieve the insurance policy catalog |
| `POST` | `/api/recommendations/score` | Compute IRS scores based on health profile & budget |
| `GET` / `POST` | `/api/claims/` | Manage insurance claims |
| `GET` / `POST` | `/api/prior-auth/` | Manage prior-authorization requests |
| `POST` | `/api/advisor/chat` | AI insurance advisory conversation |
| `GET` | `/api/analytics/dashboard` | Platform overview analytics (Admin only) |
| `WS` | `/ws/{user_id}` | Real-time event notifications stream |

---

## 🔧 Configuration & Environment Variables

Settings are configured via `backend/.env`:

| Variable | Default Value | Description |
|---|---|---|
| `DATABASE_URL` | `sqlite:///./insuresync.db` | SQLAlchemy connection string (supports PostgreSQL) |
| `MONGO_URI` | `mongodb://localhost:27017` | Optional MongoDB connection for document storage |
| `MONGO_DB` | `insuresync_docs` | Database name for MongoDB |
| `JWT_SECRET` | `change-this-to-a-long-random-string` | Secret key used for signing JWT tokens |
| `JWT_ALGORITHM` | `HS256` | Token hashing algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `120` | JWT expiration duration in minutes |
| `OPENAI_API_KEY` | *(empty)* | Optional OpenAI key for the GPT-4o-mini chatbot |
| `OPENAI_MODEL` | `gpt-4o-mini` | Model name for the OpenAI advisor |
| `CORS_ORIGINS` | `http://localhost:5173` | Allowed frontend CORS origins |

> ⚠️ Always replace `JWT_SECRET` with a strong, random value before any non-local deployment.

---

## ❓ Troubleshooting & FAQs

**1. PowerShell script execution error (`run.ps1`)**
> `File ...\run.ps1 cannot be loaded because running scripts is disabled on this system.`

Fix — run in PowerShell:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

**2. Port conflicts (8000 or 5173 already in use)**
> `Error: listen EADDRINUSE: address already in use`

Fix:
- Backend — change `--port 8000` to another port in `backend/app/main.py` and update the proxy in `frontend/vite.config.js`.
- Frontend — Vite automatically suggests an alternate port (e.g., `5174`).

**3. Missing dependencies**

Fix — activate your Python virtual environment before running `pip install -r requirements.txt`, and confirm `node -v` reports `>= 18.0.0`.

---

## 🖼️ Screenshots

### Login

Sign-in screen with the InsureSync AI healthcare workspace branding.

![Login page](c:\Users\bmaru\Downloads\login-page.png)

### Health Profile

Customers upload a bank statement, health report, and habits log to generate an ML-driven risk assessment across diabetes, hypertension, and heart disease.

![Health profile & risk classifiers](c:\Users\bmaru\Downloads\health-profile.png)

### Recommendations

The IRS-ranked policy catalog with a fully expandable score ledger showing Coverage Fit, Benefits Match, Claim Reliability, and Premium Cost.

![IRS-ranked recommendations](c:\Users\bmaru\Downloads\recommendations.png)

### Claims & Prior Authorization

Real-time claim submission and status tracking dashboard.

![Claims & prior authorization](c:\Users\bmaru\Downloads\claims-prior-auth.png)

### Local Development Servers

<table>
<tr>
<td width="50%">

**Backend — FastAPI / Uvicorn**
![Backend server startup](c:\Users\bmaru\Downloads\backend-server-startup.png)

</td>
<td width="50%">

**Frontend — Vite dev server**
![Frontend dev server startup](c:\Users\bmaru\Downloads\frontend-dev-server.png)

</td>
</tr>
</table>

---

## 📄 License & Academic Note

Developed as an advanced academic project for **CSE (Data Science)**, demonstrating AI-driven health risk assessment, multi-criteria recommendation algorithms, and real-time healthcare workflow systems.

