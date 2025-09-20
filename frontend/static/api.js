const API_base_url = "http://localhost:8000";

async function registerUser(username, email, password) {
  const response = await fetch(`${API_base_url}/auth/create_user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, email, password }),
  });
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      throw new Error(`Register failed: ${response.status}`);
    }

    // Throw the backend detail (username/email already exists)
    throw new Error(errorData.detail || `Register failed: ${response.status}`);
  }
  return response.json();
}

async function apiFetch(endpoint, options = {}, raw = false) {
  const token = localStorage.getItem("token");

  const headers = options.headers || {};

  

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  options.headers = headers;

  let response;
  try{ 
    response = await fetch(`${API_base_url}${endpoint}`, options);
  } catch (error) {
    showError("Network error: " + error.message);
  }
  if (raw) {
    return { response, data: null }; // leave response untouched
  }
  let data;
  try {
    data = await response.json();
  } catch (e) {
    data = null;
  }



  // 🔥 Auto-redirect if unauthorized
  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("currentSummeryNoteId");
    localStorage.removeItem("currentNoteSummary");
    window.location.href = "login.html";
    return; // stop here
  }

  return { response, data };
}

async function loginUser(username, password) {
  console.log("Logging in with:", username, password );
  const { response, data } = await apiFetch("/auth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      username: username,
      password: password,
    }),
  });
  console.log("Response:", response);
  console.log("Data:", data);
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      throw new Error(`Register failed: ${response.status}`);
    }

    // Throw the backend detail (username/email already exists)
    throw new Error(errorData.detail || `Register failed: ${response.status}`);
  }
  console.log("Login successful:", data);
  localStorage.setItem("token", data.access_token);
  return data;
}

async function uploadNotes(formData) {
  const { response, data } = await apiFetch("/note/upload_files", {
    method: "POST",

    body: formData,
  });
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      throw new Error(`Upload failed: ${response.status}`);
    }

    throw new Error(errorData.detail || `Upload failed: ${response.status}`);
  }
  return data;
}

async function getUsersNotes() {
  const { response, data } = await apiFetch("/note/get_user_notes/{id}", {});
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      throw new Error(`Upload failed: ${response.status}`);
    }

    throw new Error(errorData.detail || `Upload failed: ${response.status}`);
  }
  return data;
}

async function getNoteById(noteId) {
  const { response, data } = await apiFetch(
    `/note/get_user_note/${noteId}`,
    {}
  );
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      throw new Error(`Upload failed: ${response.status}`);
    }

    throw new Error(errorData.detail || `Upload failed: ${response.status}`);
  }
  return data;
}

async function downloadNotes(noteId) {
  const { response } = await apiFetch(
    `/note/download_note/${noteId}`,
    {}, true
  );
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || `Download failed: ${response.status}`);
  }
  
  const blob = await response.blob();
  return blob
}

async function summerizeNotes(note_id) {
    const { response, data } = await apiFetch(
      `/note/summerization/{id}?note_id=${note_id}`,
      {
        method: "POST",
      }
    );
  if (response.status === 503) {
      showError("No Internet Connection. Please try again later.");
    }
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      throw new Error(`Network Error: ${response.status}`);
    }
    throw new Error(errorData.detail || `Network Error: ${response.status}`);
    
  }
    
  return data;
}

async function generateQuiz(note_id, amount, mcq) {
  const { response, data } = await apiFetch(
    `/note/quizz_generation/{id}?note_id=${note_id}`,
    {
      method: "POST",
    }
  );
  if (response.status === 503) {
      showError("No Internet Connection. Please try again later.");
    }
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      throw new Error(`Network Error: ${response.status}`);
    }

    throw new Error(errorData.detail || `Network Error: ${response.status}`);
  }
  console.log("DATA:", data);
  console.log("Response:", response);
  return data;
}

async function deleteNote(note_id) {
  const { response, data } = await apiFetch(`/delete/${note_id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      throw new Error(`Network Error: ${response.status}`);
    }

    throw new Error(errorData.detail || `Network Error: ${response.status}`);
  }
  return data;
}
async function deleteAccount() {
  const { response, data } = await apiFetch(`/delete_user/{id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      throw new Error(`Network Error: ${response.status}`);
    }

    throw new Error(errorData.detail || `Network Error: ${response.status}`);
  }
  return data;
}
