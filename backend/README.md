# ⚙️ Backend – LegalMate

This is the **FastAPI backend** for LegalMate.  

Handles:
- 🔑 User authentication (register, login, JWT)
- 📂 Document upload & retrieval
- ✍️ AI-powered summarization
- ❓ AI-powered deposition-style quiz generation
- 🗑️ User and document deletion (with admin-only endpoints)

---

## 🛠️ Setup & Run

### 1. Create a virtual environment
```bash
python -m venv venv
# Activate it
# On Linux/Mac:
source venv/bin/activate
# On Windows:
venv\Scripts\activate
```
### 2. Install dependencies
```bash
pip install -r requirements.txt
```
### 3 Run the server
```bash
uvicorn server:app --reload
```
#### Backend will be live at:
👉 http://127.0.0.1:8000

#### Swagger API docs:
👉 http://127.0.0.1:8000/docs

### 🔑 Environment Variables

Create a .env file inside /backend/:
```ini
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
GOOGLE_API_KEY=your_google_api_key_here
```

---

## 📘 API Endpoints (MVP)
### 🔑 Authentication
```yaml
POST /register → Register new user
POST /login → Login and get JWT token
GET /user → Get details of the currently authenticated user
```
### 📂 Documents
```ini
POST /upload_doc → Upload a legal document
GET /user_docs → Get all documents belonging to the logged-in user
GET /doc/{doc_id} → Get a specific document (by ID)
GET /download/{doc_id} → Download a document
DELETE /delete_doc/{doc_id} → Delete one of the user’s documents
```
