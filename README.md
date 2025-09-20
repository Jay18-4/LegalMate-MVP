# ⚖️ LegalMate – AI-Powered Legal Document Assistant

**LegalMate** helps **lawyers and law students** upload legal documents, generate **summaries**, and practice with **AI-generated deposition-style quizzes**.  
Quizzes are designed to mimic **opposing counsel’s prep questions** to strengthen arguments and spot weak points.  

Built with **FastAPI (backend)** and **HTML/CSS/JS (frontend)**.

---

## 🚀 Features
- ✅ User registration & login (JWT authentication)
- ✅ Upload and manage legal documents (PDF, DOCX, TXT)
- ✅ AI-powered **legal summaries**
- ✅ AI-powered **deposition-style quizzes**
- ✅ Dashboard to view and manage uploaded files
- ✅ Download summary/quiz as PDF

---

## 📂 Project Structure
LegalMate_App/
│── backend/ # FastAPI backend (auth, docs, AI endpoints)
│── frontend/ # HTML/CSS/JS frontend
│── docs/ # Screenshots & demo video
│── README.md # Main project readme

---


---

## ⚙️ Tech Stack
- **Backend**: FastAPI, SQLAlchemy, JWT, Passlib  
- **Frontend**: HTML, CSS, Vanilla JS  
- **Database**: SQLite (MVP, can upgrade later)  
- **AI**: Google Generative AI API for summaries & quizzes  

---

## 🛠️ Setup & Run

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --reload
```

Backend will run at:
👉 http://127.0.0.1:8000

Swagger docs:
👉 http://127.0.0.1:8000/docs

### Frontend
Open:
