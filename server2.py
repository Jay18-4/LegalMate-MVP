from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Request
from fastapi.responses import FileResponse
import shutil
from starlette import status
from typing import Annotated, List, Union
from sqlalchemy.orm import Session
from pydantic import BaseModel
import os
from pathlib import Path
import uuid
import requests
from dotenv import load_dotenv
import re
import json
from fastapi.middleware.cors import CORSMiddleware
from PyPDF2 import PdfReader
from docx import Document
import mammoth
from fastapi.staticfiles import StaticFiles
import httpx
from datetime import date
import datetime
import tempfile
from docx2pdf import convert
from google import genai
from google.genai import types


from backend.database import engine, session_local
from backend import models
from backend.models import Note, User
from backend import auth
from backend.auth import get_current_user

app = FastAPI()
app.include_router(auth.router)
# app.add_middleware(SessionMiddleware, secret_key="your-secret-key")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # for dev, allow all; restrict later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

load_dotenv()

SESSION_SECRET_KEY = os.getenv("SESSION_SECRET_KEY")
TOKEN = os.getenv("TOKEN")

models.database.Base.metadata.create_all(bind=engine)

class NoteBase(BaseModel):
    title : str

    class Config:
        from_attributes = True

class NoteRetrive(NoteBase):
    content : str
    file_type : str
    stored_name : str
    uploaded_at : date

class NoteGet(NoteBase):
    custom_id : int
    file_size : float
    file_type : str


class NoteSummerizer(NoteBase):
    status_code: int
    summary: Union[str, dict]
    created_at: date
    
class NoteQuiz(NoteBase):
    question : Union[str,list] 
    answer : Union[str,list] 
    created_at: date
    
class NoteQuizError(NoteQuiz):
    error: str

class NoteSummerizerError(NoteSummerizer):
    error: str


upload_dir = Path(r"C:\Users\dalu\OneDrive\Documents\python stuff\IT Stuff\Legally_App\uploads")
upload_dir.mkdir(exist_ok=True)


def get_db():
    db = session_local()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[dict, Depends(get_current_user)]

@app.get("/get_users", status_code=status.HTTP_200_OK)
async def all_useers(db: db_dependency):
    user = db.query(User).all()
    return user

@app.get("/get_user", status_code=status.HTTP_200_OK)
async def user( user: user_dependency, db: db_dependency):
    if user is None:
        raise HTTPException(status_code=401, detail='Authentification Failure')
    os.makedirs(upload_dir/str(user["id"]), exist_ok=True)
    user_folder = upload_dir/str(user["id"])
    return {'User': user, "Path": user_folder}

@app.get("/get_all_notess")
async def all_notes(db: db_dependency):
    notes = db.query(Note).all()
    return len(notes)

@app.get("/note/get_all_users_notes")
async def get_all_notes(db: db_dependency):
    notes = db.query(Note).all()
    return notes

@app.get("/note/get_user_notes/{id}", response_model=List[NoteGet])
async def get_user_notes(request: Request,db: db_dependency, user = Depends(user)):
    user_id = user['User']['id']
    notes = (db.query(Note).filter(Note.uploaded_by == user_id).order_by(Note.uploaded_at.asc()).all())
    if not notes:
        return notes
    

    return [
        NoteGet(custom_id=i,
        title=n.title,
        file_size=n.file_size,
        file_type=n.file_type
    )
        for i, n in enumerate(notes, start=1)
    ]

def extract_note_text(file_path, file_type, file_name,user_id, request: Request):
    if file_type.startswith("text/plain"):
        with open(file_path, "r", encoding="utf-8") as f:
            note_text = f.read()
            return note_text

    elif file_type.startswith("application/pdf"):
        return str(request.url_for("uploads", path=f'{user_id}/{file_name}'))
    
    elif file_type in ["application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                       "application/msword"]:
        with open(file_path, "rb") as f:
            result = mammoth.convert_to_html(f)
            note_text = result.value
        return note_text

    return "Unsupported file type"

def custom_order(note_id, db: db_dependency, user = Depends(user)):
    user_id = user['User']['id']
    # Check if the user has notes
    notes = (db.query(Note).filter(Note.uploaded_by == user_id).order_by(Note.uploaded_at.asc(), Note.id.asc()).all())
    
    custom_map = {i: n for i, n in enumerate(notes, start=1)}

    return custom_map.get(note_id)

@app.get("/note/get_user_note/{note_id}", response_model=NoteRetrive, )
async def get_note(note_id: int ,db: db_dependency,request: Request, user = Depends(user)):
    user_id = user['User']['id']
    note = custom_order(note_id, db, user)

    note_content = extract_note_text(note.file_path, note.file_type, note.stored_filename,user_id, request)
    date = note.uploaded_at.date()
    return NoteRetrive(
        title=note.title,
        content=note_content,
        file_type=note.file_type,
        stored_name = note.stored_filename,
        uploaded_at=date
    )


@app.get("/note/download_note/{note_id}")
async def download_notes(note_id: int ,db: db_dependency, user = Depends(user)):
    note = custom_order(note_id, db, user)

    if not note:
         raise HTTPException(status_code=404, detail="File Not Found")
    
    return FileResponse(
        path= note.file_path,
        filename= note.title,
        media_type="application/octet-stream"
    )

    


@app.post("/note/upload_files", status_code=status.HTTP_201_CREATED)    
async def file_upload(db: db_dependency,
                      file: UploadFile = File(...),
                      user = Depends(user)
                      ):
    if not file:
        return {"messsage": "No UploadFile Sent"}
    user_path = user["Path"]
    ext = file.filename.split(".")[-1]
    stored_file_name = f'{uuid.uuid4()}.{ext}'
    unique_file_name = f"{stored_file_name}"
    file_path = upload_dir/ user_path/ unique_file_name
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    new_note = Note(
        title = file.filename,
        file_path = str(file_path),
        file_size = os.path.getsize(file_path),
        file_type = file.content_type,
        uploaded_by = user['User']['id'],
        stored_filename = stored_file_name
    )
    db.add(new_note)
    db.commit()

    return {"file_size": file.filename, "type": file.content_type}




def file_type(file_type,file_path):
    if file_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        with open(file_path, "rb") as f:
            result = mammoth.convert_to_html(f)
            return result.value
    else:
        with open(file_path, "rb") as f:
            return f.read()

    

@app.post("/note/summerization/{id}", response_model=Union[NoteSummerizer, NoteSummerizerError])
async def summery(note_id: int, db: db_dependency, user = Depends(user)):
    note = custom_order(note_id, db, user)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    note_text = file_type(note.file_type,note.file_path)
            
    if not note_text.strip():
        return NoteSummerizer(
            title=note.title,
            status_code=400,
            summary={"error": "Note is empty or contains only whitespace"},
            created_at= datetime.date.today()
    )

    message = """
        Carefully read the following document. 
        Instead of reproducing the text, 
        create a concise summary that highlights the most important 
        claims, facts, and positions made in the document.
        Guidelines for the summary:
        Write as if you are preparing to challenge the document in court.
        Emphasize any points that seem weak, vague, inconsistent, or unsupported.
        Highlight contradictions, omissions, and areas where credibility might be questioned.
        Keep the summary sharp, factual, and critical, focusing on what can be used against the opposition.
        Do not include your own arguments, just a structured summary that makes the vulnerabilities clear.
        Document to analyze:
        """
    try:
        client = genai.Client()
        config = types.GenerateContentConfig(
        system_instruction="You are an opposing lawyer preparing for cross-examination",
        thinking_config=types.ThinkingConfig(
            thinking_budget=0
            )
        )
        if note.file_type == "text/plain" or  note.file_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            contents=[f"""{message}
                Return ONLY valid JSON in this format:
                "summary": "summary" 
                """, note_text]
        
        if note.file_type == "application/pdf":
            contents=[
                types.Part.from_bytes(
                data=note_text,
                mime_type="application/pdf",
                ),
                f"""{message}
                Return ONLY valid JSON in this format:
                "summary": "summary"
                """
            ]
        

        response = client.models.generate_content(
            model='gemini-2.5-flash-lite',
            contents=contents,
            config=config
        )
        result = response.text
        message_content = re.sub(r"^```(?:json)?\n?|\n?```$", "", result.strip())
        try:
            data = json.loads(message_content)
        except json.JSONDecodeError as e:
            return{"Failed to decode JSON:": e, "Raw output from model:\n": message_content}
        
        if not isinstance(result, list) and "error" in result:
            return NoteSummerizer(
                title=note.title+"_Summery",
                status_code=501,
                summary={"error": result["error"]},
                created_at=datetime.date.today()
            )
         
        return NoteSummerizer(
            title=note.title+"_Summery",
            status_code=200,
            summary=data["summary"],
            created_at=datetime.date.today()
        )
    except httpx.ConnectError:
    # Cannot connect (DNS failure, no internet, server down)
        raise HTTPException(status_code=503, detail="Service unavailable: cannot reach external API")

    except httpx.TimeoutException:
        # API didn't respond in time
        raise HTTPException(status_code=504, detail="External API request timed out")

    except httpx.HTTPStatusError as e:
        # Got a response but it's an error (4xx/5xx)
        raise HTTPException(status_code=e.response.status_code, detail=f"External API error: {e.response.text}")

    except Exception as e:
        # Anything else (safety net)
        if "402 Client Error" in str(e):
            return NoteSummerizerError(
                title=note.title+"_Summery",
                status_code=200,
                summary={"summary": "This is a dummy summary."},
                created_at=datetime.date.today(),
                error=f"This is a dummy response due to API error.{e}"
            )
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
    

@app.post("/note/quizz_generation/{id}", response_model=Union[NoteQuiz, NoteQuizError])
async def quizz_generation(note_id: int, db: db_dependency, user = Depends(user)):
    note = custom_order(note_id, db, user)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    note_text = file_type(note.file_type,note.file_path)

    if not note_text.strip():
        return NoteSummerizer(
            title=note.title,
            status_code=400,
            summery={"error": "Note is empty or contains only whitespace"},
            created_at=datetime.date.today()
    )



    message = f"""Carefully read the following document. Your job is to identify weaknesses, 
        inconsistencies, omissions, exaggerations, or areas where credibility can be challenged. 
        Then, generate a series of sharp, probing, and strategically phrased questions that you would ask the opposing party or witness.
        Guidelines for the questions:
        Ask as if you are in court trying to undermine or test their position.
        Make the questions short, direct, and difficult to avoid answering.
        Focus on logical gaps, contradictory claims, lack of evidence, or unclear definitions.
        Use a confident, professional, but skeptical tone.
        After provide answers the questions.
        Document to analyze:"""
   
    try:
        client = genai.Client()
        config = types.GenerateContentConfig(
        system_instruction="You are an opposing lawyer preparing for cross-examination",
        thinking_config=types.ThinkingConfig(
            thinking_budget=0
            )
        )
        if note.file_type == "text/plain" or  note.file_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            contents=[f"""
                {message}
                Return ONLY valid JSON in this format for theory:
                "questions": ["question1", "question2", "question3"],
                "answers": ["answer1", "answer2", "answer3"]
                """, note_text]
        
        if note.file_type == "application/pdf":
            contents=[
                types.Part.from_bytes(
                data=note_text,
                mime_type="application/pdf",
                ),
                f"""
                {message}
                Return ONLY valid JSON in this format for theory:
                "questions": ["question1", "question2", "question3"],
                "answers": ["answer1", "answer2", "answer3"]
                """
            ]
        

        response = client.models.generate_content(
            model='gemini-2.5-flash-lite',
            contents=contents,
            config=config
        )
        result = response.text
        message_content = re.sub(r"^```(?:json)?\n?|\n?```$", "", result.strip())
        try:
            data = json.loads(message_content)
        except json.JSONDecodeError as e:
            return{"Failed to decode JSON:": e, "Raw output from model:\n": message_content}
        
        if "error" in response:
            return NoteQuiz(
                title=note.title+"_theory_questions",
                question=["Dummy Question","Mock Question"],
                answer=["Dummy Answer", "Mock Answer"]
            )
        return NoteQuiz(
            title=note.title+"_questions",
            question=data['questions'],
            answer=data["answers"],
            created_at=datetime.date.today()
        )
    except httpx.ConnectError:
    # Cannot connect (DNS failure, no internet, server down)
        raise HTTPException(status_code=503, detail="Service unavailable: cannot reach external API")

    except httpx.TimeoutException:
        # API didn't respond in time
        raise HTTPException(status_code=504, detail="External API request timed out")

    except httpx.HTTPStatusError as e:
        # Got a response but it's an error (4xx/5xx)
        raise HTTPException(status_code=e.response.status_code, detail=f"External API error: {e.response.text}")

    except Exception as e:
        # Anything else (safety net)
        if "402 Client Error" or "Max retries exceeded " in str(e):
            return NoteQuizError(
                title=note.title+"_short_summery",
                question=["Dummy Question","Mock Question"],
                answer=["Dummy Answer", "Mock Answer"],
                created_at=datetime.date.today(),
                error=f"This is a dummy response due to API error:{e}"
            )
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}")




@app.delete("/delete_user/{id}")
async def delete_user(db: db_dependency, user= Depends(user)):
    user_id = user['User']['id']
    user_path = user["Path"]
    try:
        db.query(Note).filter(Note.uploaded_by == user_id).delete()
        db.query(User).filter(User.id == user_id).delete()
        db.commit()
    except Exception as e:
        return {"error": e}
    if os.path.isdir(user_path):
        try:
            shutil.rmtree(user_path)
            return {"detail": "Note Folder deleted successfully"}
        except PermissionError:
            return f"Error:Permission Denied {user_path}"
        except Exception as e:
            return {"error": e}

@app.delete("/delete/{note_id}")
async def delete_note(note_id: int,db: db_dependency, user = Depends(user)):
    note = custom_order(note_id, db, user)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    # file_path = upload_dir / "uploads" / note.stored_filename
    if os.path.exists(note.file_path):
        try:
            os.remove(note.file_path)
            db.delete(note)
            db.commit()
            return {"detail": "Note deleted successfully"}
        except PermissionError:
            return f"Error:Permission Denied {note.file_path}"
        except Exception as e:
            return {"error": e}
    else:
        return f"File Not Found {note.file_path}"

# @app.delete("/delete_all_notes", status_code=status.HTTP_204_NO_CONTENT)
# async def delete_all_notes(db: db_dependency):
#     db.query(Note).delete()
#     db.commit()

# @app.delete("/delete_all_users", status_code=status.HTTP_204_NO_CONTENT)
# async def delete_all_users(db: db_dependency):
#     db.query(User).delete()
#     db.commit()


    