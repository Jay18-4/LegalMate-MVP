console.log("✅ main.js loaded");

// Globa Variables
const uploadNoteBtn = document.getElementById("uploadNotesBtn");
const fileInput = document.getElementById("fileInput");
const shortSummerizeNoteBtn = document.getElementById("shortSummerizeNoteBtn");
const generateQuizBtn = document.getElementById("generateQuizBtn");
const result = document.getElementById("result");
const noteContent = document.getElementById("noteContent");
const noteTitle = document.getElementById("noteTitle");
const noteDate = document.getElementById("noteDate");
const summaryContent = document.getElementById("summaryContent");
const quizContent = document.getElementById("quizContent");
const quizForm = document.getElementById("quizForm");
const deleteNoteBtn = document.getElementById("deleteNoteBtn");
const deleteUserBtn = document.getElementById("delete-user-btn");
const summaryDownloadBtn = document.getElementById("summaryDownload");
const quizDownloadBtn = document.getElementById("quizDownload");
const errorBanner = document.getElementById("errorBanner");
const quizDate = document.querySelector(".quiz-date");
const answerDate = document.querySelector(".answer-date");
const downloadNoteBtn = document.getElementById("downloadNoteBtn");

// Hambuger Menue Vaariables
const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.getElementById('sidebar-links');
const sideBar = document.getElementById("sidebar");
const btnMenuToggle = document.getElementById("btn_menu-toggle");
const btnMenu = document.getElementById("btnMenu");
const siteBtns = document.getElementById("siteBtns");
const dashboardMainContainer = document.querySelector(".main-container");


document.addEventListener("DOMContentLoaded", () => {
  if(menuToggle){
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      sideBar.classList.toggle('active');
    });
  }
  if(btnMenuToggle){
    btnMenuToggle.addEventListener("click", () => {
      console.log("CLICKED!!!!!!!!!!!");
      btnMenu.classList.toggle("btn-active");
      console.log("WORKING!!!");
    })
  }

  // Question and Answer Button
const answerContainer = document.querySelector(".answer-detail-container");
const questionContainer = document.querySelector(".question-detail-container");
const showAnswerBtn = document.getElementById("showAnswer");
const answerContent = document.getElementById("answerContent");
const hideQuestionBtn = document.getElementById("hideQuestion");
  if(showAnswerBtn && hideQuestionBtn){
    showAnswerBtn.addEventListener("click", () => {
      quizContent.classList.toggle("active");
      answerContent.classList.toggle("active");
      answerContainer.classList.toggle("active");
      answerContainer.classList.toggle("reduce-padding");
      questionContainer.classList.toggle("reduce-padding");
    })
    hideQuestionBtn.addEventListener("click", () => {
      answerContent.classList.toggle("active");
      questionContainer.classList.toggle("active");
      answerContainer.classList.toggle("reduce-padding");
    })
  }
});

// Theme
const toggleSwitch = document.querySelector('.switch input[type="checkbox"]');
function switchTheme(e) {
    if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }
    else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }    
}
toggleSwitch.addEventListener('change', switchTheme, false);

const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;

if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);

    if (currentTheme === 'dark') {
        toggleSwitch.checked = true;
    }
}


// handleRegistration & handleLogin function caller
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed");
  const registerForm = document.getElementById("registerForm");
  const loginForm = document.getElementById("loginForm");
  if (registerForm) {
    registerForm.addEventListener("submit", handleRegistration);
  }
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }
});

// Download Button for summaries and quizzes
document.addEventListener("DOMContentLoaded", () => {
  const summaryDownloadBtn = document.getElementById("summaryDownload");
  const quizDownloadBtn = document.getElementById("quizDownload");
  const currentNoteSummary = localStorage.getItem("currentSummary") || "No summary available";
  const currentQuiz = localStorage.getItem("currentQuiz") || "No quiz available"; 
  
  if (summaryDownloadBtn){
    summaryDownloadBtn.addEventListener("click", () => {
      downloadFile(currentNoteSummary);
    });
  }
  if (quizDownloadBtn) {
    quizDownloadBtn.addEventListener("click", () => {
      downloadFile(currentQuiz);
    });
  }
});


// Helper Function for File Download
function downloadFile(file) {
  const {jsPDF}= window.jspdf;
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.height; // page height in units
  const margin = 10;
  const lineHeight = 10;
  doc.setFont("times", "normal");
  doc.setFontSize(12);
  
  const splitText = doc.splitTextToSize(file, 180);
  let cursorY = margin;

  splitText.forEach((line) => {
    if (cursorY + lineHeight > pageHeight - margin) {
      doc.addPage();
      cursorY = margin; // Reset cursor to top margin on new page
    }
    doc.text(line, margin, cursorY);
    cursorY += lineHeight;
  });

  doc.save(noteTitle.innerText + "_summary.pdf");
};

// Settings Button
document.addEventListener("DOMContentLoaded", () => {
  const settingBanner = document.getElementById("settingBanner");
  const settingIcon = document.getElementById("setting-icon");
  if (settingBanner && settingIcon) {
    settingIcon.addEventListener("click", () => {
      settingBanner.style.display = "block";
    })
    settingBanner.addEventListener('click', function(event) {
      if (event.target === settingBanner) {
        settingBanner.style.display = 'none';
      }
    })
  }
});

// Helper Function for Shoing Error
function showError(message){
  const errorBanner = document.getElementById("errorBanner");
  if (errorBanner) {
    errorMessage.innerHTML = `<p>${message}</p>`;
    errorBanner.style.display = "block";

    errorBanner.addEventListener('click', function(event) {
    if (event.target === errorBanner) {
      errorBanner.style.display = 'none';
    }
  });
  } else {
    console.error("Error banner not found in DOM");
  }
}

// Helper Function for Showing Api Status
function showApiStatus(message){
  const errorBanner = document.getElementById("errorBanner");
  if (errorBanner) {
      errorMessage.innerHTML = `<p>${message}</p>`;
      errorBanner.style.display = "block";

      errorBanner.addEventListener('click', function(event) {
      if (!message.includes("wait") && event.target === errorBanner){
        errorBanner.style.display = 'none';
      }
    })
  }
}


// Helper Function for showing Download Button
function showDownloadBtn(){
  const summaryBtnContainer = document.getElementById("summaryBtnContainer");
  const quizBtnContainer = document.getElementById("quizBtnContainer");
  const noteId = localStorage.getItem("currentNoteId");
  const currentSummaryNoteId = localStorage.getItem("currentSummaryNoteId");
  const currentNoteSummary = localStorage.getItem("currentSummary");
  const currentQuizNoteId = localStorage.getItem("currentQuizNoteId");
  const currentQuiz = localStorage.getItem("currentQuiz");

  if (summaryBtnContainer && currentSummaryNoteId === noteId && currentNoteSummary !== "<p>No summary available for this note.</p>") {
    summaryBtnContainer.style.display = "block";
  };
  
  if (quizBtnContainer && currentQuizNoteId === noteId && currentQuiz !== "<p>No quiz available for this note.</p>") {
    quizBtnContainer.style.display = "block";
  };
};



// Registraation Function
async function handleRegistration(event) {
  event.preventDefault(); // Prevent the default form submission

  // Collect user data from the form
  const username = document.getElementById("registerUsername").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("registerPassword").value;

  try {
    const data = await registerUser(username, email, password);

    // success
    result.textContent = data.message || "User registered successfully!";
    result.style.color = "green";
  } catch (err) {
    // error
    result.textContent = err.message; // will show "Register failed: 400"
    result.style.color = "red";
  }
  if (result.textContent === "User registered successfully!") {
    window.location.href = "login.html"; // Redirect to login page after successful registration
    console.log("Trying to auto login...");
    autoLogin(username, password);
    console.log("Auto login after registration...");
  }
};


// Login Function
async function handleLogin(event) {
  event.preventDefault(); // Prevent the default form submission
  console.log(" form submit triggered");

  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const data = await loginUser(username, password);

    // success
    result.textContent = data.message || "User registered successfully!";
    result.style.color = "green";
    // localStorage.setItem("token", data.access_token);
    window.location.href = "dashboard.html"; // redirect to dashboard
  } catch (err) {
    // error
    result.textContent = err.message; // will show "Register failed: 400"
    result.style.color = "red";
  }
  if (result.textContent === "User registered successfully!") {
    window.location.href = "dashboard.html"; // Redirect to dashboard after successful login
  }
}

// File Upload Function
async function uploadNote(event) {
  const file = event.target.files[0];
  if (!file) {
    return (result.textContent = "Please select a note file to upload!");
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const data = await uploadNotes(formData);

    result.textContent = data.message || "Note uploaded successfully!";
    result.style.color = "green";
  } catch (err) {
    result.textContent = err.message; // will show "Upload failed: 400"
    result.style.color = "red";
  }
}

// File Download Function
async function downloadNote() {
  const noteId = localStorage.getItem("currentNoteId");
  const storedName = localStorage.getItem("noteTitle");

  try {
    const data = await downloadNotes(noteId);
    const url = window.URL.createObjectURL(data);
    console.log("Nooo");
    const a = document.createElement("a");
    a.href = url;
    a.download = storedName; 
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    window.URL.revokeObjectURL(url);
    
  } catch (err) {
    console.error(err);
    alert("Download failed");
  }
}

// Document Display Function
async function displayNotes() {
  try {
    const data = await getUsersNotes();

    const noteList = document.getElementById("noteList");
    noteList.innerHTML = "";

    data.forEach((note) => {
      
      const noteItem = document.createElement("article");
      noteItem.className = "note-item";
      noteItem.tabIndex = 0     
      noteItem.dataset.id = note.custom_id;

      noteItem.innerHTML +=`
            <h3>${note.title}</h3>
            <div class="note_container-div">
            <footer class="btn-container">
            <button class="note_container-btn note_container-btn--ghost summarize-btn"">Summarize</button>
            <button class="note_container-btn note_container-btn--ghost quiz-btn"">Quiz</button>
            </footer>
            </div>
      `;

      noteList.appendChild(noteItem);

      const summarizeBtn = noteItem.querySelector(".summarize-btn");
      const quizBtn = noteItem.querySelector(".quiz-btn");
      
      noteItem.addEventListener("click", (e) => {
          if (e.target !== summarizeBtn && e.target !== quizBtn) {
            const noteId = noteItem.dataset.id;
          
          if (noteId) {
            localStorage.setItem("currentNoteId", noteId);
              window.location.href = "notes.html";
          }
        }
      });

        

      summarizeBtn.addEventListener("click", () => {
        const noteId = noteItem.dataset.id;
        if (noteId) {
            localStorage.setItem("currentNoteId", noteId);
            noteSummary()
        }
        
      });
      if (quizBtn) {
      const noteId = noteItem.dataset.id;
      localStorage.setItem("currentNoteId", noteId);
      quizBtn.addEventListener("click", quizGeneration)};
    });
    
    
  } catch (err) {
    console.error("Error fetching notes:", err);
  }
  
  console.log("displayNote function is running...");
}


// Opening Document Function
async function openNote() {
  const noteId = localStorage.getItem("currentNoteId");
  const currentSummaryNoteId = localStorage.getItem("currentSummaryNoteId")
  const currentQuizNoteId = localStorage.getItem("currentQuizNoteId");
  
  
  if (!noteId) {
    console.error("No note ID found in localStorage.");
    return;
  }

  try {

    if (currentSummaryNoteId === noteId) {
      showDownloadBtn();
    }
    if (currentQuizNoteId === noteId) {
      showDownloadBtn();
    } 
  } catch (err) {
    console.error("Error fetching note summary:", err);
  }

  try {
    const data = await getNoteById(noteId);
    localStorage.setItem("noteTitle", data.title);

    noteTitle.textContent = data.title || "Untitled Note";
    noteDate.textContent = `Created on ${data.uploaded_at}`;

    if (data.file_type.startsWith("text/plain")) {
      noteContent.innerHTML = `<pre class="txtFile">${data.content}</pre>`;
    } else if (
      data.file_type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      data.file_type === "application/msword"
    ) {
      noteContent.innerHTML = data.content;
    } else if (data.file_type.startsWith("application/pdf")) {
      noteContent.innerHTML = `<iframe class="note-conten" src="${data.content}" width="100%" height="600px"></iframe>`;
    } else {
      noteContent.textContent = "Unsupported file type." + data.file_type;
    }
  } catch (err) {
    console.error("Error opening note:", err);
  }
  }


// Summary Function
async function noteSummary() {
  const noteId = localStorage.getItem("currentNoteId");
  
  try {
    showApiStatus("Generating summary, please wait...");
    const data = await summerizeNotes(noteId);


    localStorage.setItem("currentSummary", data.summary); 
    localStorage.setItem("currentSummaryNoteId", noteId);  
    localStorage.setItem("currentSummaryDate", data.created_at);
    
    showApiStatus("Summary generated successfully!")
    window.location.href = "summary.html"; 
  } catch (err) {
    console.error("Error opening note:", err);
  }

}

// Quiz Generation Function
async function quizGeneration(event) {
  event.preventDefault();
  const noteId = localStorage.getItem("currentNoteId");

  try {
    showApiStatus("Generating quiz, please wait...");
    const data = await generateQuiz(noteId);
    console.log(data);
    localStorage.setItem("currentQuiz", JSON.stringify(data.question));
    localStorage.setItem("currentQuizAnswer", JSON.stringify(data.answer));
    localStorage.setItem("currentQuizNoteId", noteId); 
    localStorage.setItem("currentQuizDate", data.created_at);

    currentQuiz = localStorage.getItem("currentQuiz");
    currentQuizAnswer = localStorage.getItem("currentQuizAnswer");
    currentQuizNoteId = localStorage.getItem("currentQuizNoteId");
    currentQuizDate = localStorage.getItem("currentQuizDate");

    showApiStatus("Quiz generated successfully!")
    window.location.href = "quiz.html";
    showDownloadBtn();
  } catch (err) {
    console.error("Error opening note:", err);
  }
}

// Document Delete Function
async function noteDelete() {
  const noteId = localStorage.getItem("currentNoteId");

  try {
    const data = await deleteNote(noteId);
    console.log(data);

    if (data["detail"] = "Note deleted successfully"){
        window.location.href = "dashboard.html";
    }
  } catch (err) {
    console.error("Error deleting note:", err);
  }
};

// Accunt Delete Function
async function accountDelete() {
  try {
    const data = await deleteAccount();
    console.log(data);

    if (data["detail"] = "Note Folder deleted successfully"){
        window.location.href = "login.html";
    }
  } catch (err) {
    console.error("Error deleting account:", err);
  }
};


// Function Callers

// Handles Upload File
if (uploadNoteBtn && fileInput) {
  uploadNoteBtn.addEventListener("click", () => {
    fileInput.click(); // opens file picker
  });

  fileInput.addEventListener("change", uploadNote);
};

// Handles Download File
if(downloadNoteBtn){
  downloadNoteBtn.addEventListener("click", () => {
  console.log("YESSS")
    downloadNote();
  });
}

// Handles Display Document
if (window.location.pathname.endsWith("dashboard.html")) {
  document.addEventListener("DOMContentLoaded", displayNotes);
};
  
// Handles Ope Document
if (window.location.pathname.endsWith("notes.html")) {
  console.log("Opening note...");
  document.addEventListener("DOMContentLoaded", openNote);
};

// Handles Summary Displaying
if(window.location.pathname.endsWith("summary.html")){
  const currentNoteSummary = localStorage.getItem("currentSummary");
  const currentSummaryNoteId = localStorage.getItem("currentSummaryNoteId");
  const noteId = localStorage.getItem("currentNoteId");
  const currentData = localStorage.getItem("currentSummaryDate")
  if (currentSummaryNoteId === noteId) {
      summaryContent.innerHTML = `<pre class="txtFile">${currentNoteSummary}</pre>`;
      summaryDate.textContent = `Created on ${currentData}`
      showDownloadBtn();
  }else {
        summaryContent.innerHTML = `<p>No summary available for this note.</p>`;
      }
};

// Handles calling Summary Function
if (shortSummerizeNoteBtn) {
  shortSummerizeNoteBtn.addEventListener("click", () => {
      noteSummary()
  });
}


// Handles Displaying Quiz
if(window.location.pathname.endsWith("quiz.html")){
  const currentQuiz = localStorage.getItem("currentQuiz");
  const currentQuizJson = JSON.parse(currentQuiz);
  const currentQuizAnswer = localStorage.getItem("currentQuizAnswer");
  const currentAnswerJson = JSON.parse(currentQuizAnswer);
  const currentQuizNoteId = localStorage.getItem("currentQuizNoteId");
  const currentQuizDate = localStorage.getItem("currentQuizDate");
  const noteId = localStorage.getItem("currentNoteId")
    if (currentQuizNoteId === noteId) {
      currentQuizJson.forEach(q => {
        const li = document.createElement("li");
        li.textContent = q;
      quizContent.appendChild(li);
      });
      quizDate.textContent = `Created on ${currentQuizDate}`


      currentAnswerJson.forEach(q => {
        const li = document.createElement("li");
        li.textContent = q;
      answerContent.appendChild(li);
      });
      answerDate.textContent = `Created on ${currentQuizDate}`
      
      showDownloadBtn();
  }else {
        quizContent.innerHTML = `<p>No Quiz available for this note.</p>`;
        answerContent.innerHTML = `<p>No Answer available for this note.</p>`;
      }
};

// Handles calling Quiz Generation Function
document.addEventListener("DOMContentLoaded", () => {
  const quizForm = document.getElementById("quizForm");
  console.log("Yhhhhhhh");
  if (quizForm) {
    quizForm.addEventListener("submit", quizGeneration)};
})

// Handles Document Deletion
if (deleteNoteBtn) {
  deleteNoteBtn.addEventListener("click", () => {
    noteDelete();
  });
}

// Handles Accunt Deletion
if(deleteUserBtn) {
  deleteUserBtn.addEventListener("click", () => {
    accountDelete();
  });
}

// Handles Logging Out
document.querySelectorAll('.logout-btn').forEach(button => {
  button.addEventListener('click', () => {
    localStorage.removeItem('token'); 
    window.location.href = 'login.html'; 
  });
});