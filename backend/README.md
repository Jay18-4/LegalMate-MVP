# ⚙️ Backend – LegalMate

This is the **FastAPI backend** for LegalMate.  

Handles:
- 🔑 User authentication (register, login, JWT)
- 📂 Document upload & retrieval
- ✍️ AI-powered summarization
- ❓ AI-powered deposition-style quiz generation
- 🗑️ User and document deletion (with admin-only endpoints)

---

## 🛠️ Setup & Run/Testing

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
- POST /register → Register new user
- POST /login → Login and get JWT token
- GET /user → Get details of the currently authenticated user

### 📂 Documents
- POST /upload_file → Upload a legal document
- GET /user_note → Get all documents belonging to the logged-in user
- GET /doc/{note_id} → Get a specific document (by ID)
- GET /download/{note_id} → Download a document
- DELETE /delete_doc/{note_id} → Delete one of the user’s documents

### ✍️ AI Features
- POST /summarize/{doc_id} → Summarize a document
- POST /quiz/{doc_id} → Generate deposition-style quiz from a document

### 👩‍💻 Admin / Dev-Only

- GET /all_users → List all registered users
- GET /all_notes → List all uploaded notes (all users)
- GET /all_users_notes → Retrieve all notes grouped by users
- DELETE /delete_user/{user_id} → Delete a specific user
- (Commented out: delete all users / delete all notes — kept only for dev testing)
