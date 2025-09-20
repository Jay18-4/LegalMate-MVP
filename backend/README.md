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

