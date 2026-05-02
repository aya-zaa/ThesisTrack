// ================= FILES =================
let files = [];
let currentTab = "inbox";
let currentView = "my";
let currentFilter = "all";

const filesContainer = document.getElementById("files-container");
const fileForm = document.getElementById("file-form");

// ===== HELPERS =====
function getCurrentDate() {
  const now = new Date();
  return now.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getFileSize(file) {
  const size = file.size / (1024 * 1024);
  return size.toFixed(2) + " MB";
}

// ===== RENDER FILES =====
function renderFiles() {
  if (!filesContainer) return;

  filesContainer.innerHTML = "";

  let filtered = files;

  if (currentFilter !== "all") {
    filtered = files.filter((f) => f.status === currentFilter);
  }

  filtered.forEach((f, i) => {
    filesContainer.innerHTML += `
    <div class="file-card">

      <div class="file-top">
        <a href="../uploads/${f.name}" target="_blank" class="file-link">
  <div class="file-icon">
          ${
            f.type === "PDF"
              ? "📄"
              : f.type === "DOCX"
                ? "📝"
                : f.type === "XLSX"
                  ? "📊"
                  : "💻"
          }
       </div>
</a>
        <span class="file-type">${f.type}</span>
      </div>

     <a href="../uploads/${f.name}" target="_blank" class="file-link">
  <div class="file-name">${f.name}</div>
</a>

      <div class="file-info">
        ${f.date} • ${f.size}
      </div>

      ${f.notes ? `<div class="file-notes">${f.notes}</div>` : ""}

      <span class="file-status ${f.status}">
        ${f.status}
      </span>

      <div class="file-actions">
        ${
          f.status === "pending"
            ? `<button class="send-btn" onclick="sendFile(${f.id})">Send</button>
`
            : `<span></span>`
        }

<button class="delete-btn" onclick="deleteFile(${f.id})">Delete</button>      </div>

    </div>
    `;
  });
}
const searchInputFiles = document.getElementById("search");

if (searchInputFiles) {
  searchInputFiles.addEventListener("keyup", () => {
    const value = searchInputFiles.value.toLowerCase();

    const filtered = files.filter((f) => f.name.toLowerCase().includes(value));

    renderFilteredFiles(filtered);
  });
}

function renderFilteredFiles(list) {
  filesContainer.innerHTML = "";

  list.forEach((f, i) => {
    filesContainer.innerHTML += `
      <div class="file-card">
        <div class="file-top">
          <div class="file-icon">📄</div>
          <span class="file-type">${f.type}</span>
        </div>

        <div class="file-name">${f.name}</div>

        <div class="file-info">
          ${f.date} • ${f.size}
        </div>

        <span class="file-status ${f.status}">
          ${f.status}
        </span>

       <div class="file-actions">
  <a href="../uploads/${f.name}" target="_blank">Open</a>

  <button onclick="sendFile(${f.id})">Send</button>

  <button onclick="deleteFile(${f.id})">Delete</button>
</div>
      </div>
    `;
  });
}

// ===== ADD FILE =====
if (fileForm) {
  fileForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const fileInput = document.getElementById("file-upload");

    if (!fileInput.files.length) return;

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);
    formData.append("notes", document.getElementById("file-notes").value);
    formData.append("type", document.getElementById("file-type").value);

    fetch("../api/upload_file.php", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.text())
      .then(() => {
        loadFiles();
        closeModal();
        fileForm.reset();
      });
  });
}
async function loadFiles() {
  const res = await fetch("../api/get_files.php");
  const data = await res.json();

  files = data.map((f) => ({
    id: f.id,
    name: f.name,
    type: f.name.split(".").pop().toUpperCase(),
    size: f.size,
    date: f.date,
    status: f.status,
  }));

  renderFiles();
}
// ===== FILTER =====
function filterFiles(type) {
  currentFilter = type;
  renderFiles();
}

// ===== MODAL =====
function openAddModal() {
  const modal = document.getElementById("modal");
  if (modal) modal.classList.remove("hidden");
}

function closeModal() {
  const modal = document.getElementById("modal");
  if (modal) modal.classList.add("hidden");
}

const btn = document.getElementById("open-modal-btn");
if (btn) {
  btn.addEventListener("click", openAddModal);
}

// ===== SEND =====
function sendFile(id) {
  fetch("../api/send_file.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "id=" + id,
  }).then(() => loadFiles());
}

// ===== DELETE =====
function deleteFile(id) {
  fetch("../api/delete_file.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "id=" + id,
  }).then(() => loadFiles());
}

function closeDeleteModal() {
  document.getElementById("delete-modal")?.classList.add("hidden");
}

document
  .getElementById("confirm-delete")
  ?.addEventListener("click", function () {});

// ===== FILE INPUT TEXT =====
const fileInputGlobal = document.getElementById("file-upload");
const fileText = document.getElementById("file-text");

if (fileInputGlobal && fileText) {
  fileInputGlobal.addEventListener("change", () => {
    fileText.textContent =
      fileInputGlobal.files.length > 0
        ? fileInputGlobal.files[0].name
        : "Choose File";
  });
}

// ================= TASKS =================
let tasks = [];
let taskFilter = "all";
let editTaskIndex = null;

const tasksContainer = document.getElementById("tasks-container");
const taskForm = document.getElementById("task-form");

if (taskForm) {
  taskForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const title = document.getElementById("task-title").value;
    const desc = document.getElementById("task-desc").value;

    if (!title.trim()) return;

    const deadline = document.getElementById("task-deadline").value;
    if (editTaskIndex !== null) {
      fetch("../api/update_task.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `id=${tasks[editTaskIndex].id}&title=${encodeURIComponent(title)}&desc=${encodeURIComponent(desc)}&deadline=${deadline}&status=${document.getElementById("task-status").value}`,
      }).then(() => location.reload());

      editTaskIndex = null;
      return;
    } else {
      // CREATE
      const newTask = {
        title: title,
        desc: desc,
        status: document.getElementById("task-status").value,
        supervisor: currentView === "supervisor",
        deadline: deadline,
      };

      tasks.push(newTask);
    }
    fetch("../api/add_task.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `title=${encodeURIComponent(title)}&desc=${encodeURIComponent(desc)}&deadline=${deadline}&status=${document.getElementById("task-status").value}`,
    }).then(() => location.reload());
    editTaskIndex = null;
    return;
    document.getElementById("task-modal")?.classList.add("hidden");

    taskForm.reset();
    document.querySelector("#task-modal h3").innerText = "Add Task";
  });
}
// ===== OPEN TASK MODAL =====
const openTaskBtn = document.getElementById("open-task-modal");

if (openTaskBtn) {
  openTaskBtn.addEventListener("click", () => {
    document.getElementById("task-modal")?.classList.remove("hidden");
  });
}

// ===== CLOSE TASK MODAL =====
function closeTaskModal() {
  document.getElementById("task-modal")?.classList.add("hidden");
}

// ===== CLOSE DELETE MODAL =====
function closeTaskDeleteModal() {
  document.getElementById("task-delete-modal")?.classList.add("hidden");
}
function loadTasks() {
  fetch("../api/get_tasks.php")
    .then((res) => res.json())
    .then((data) => {
      tasks = data;
      renderTasks();
    });
}
function renderTasks() {
  if (!tasksContainer) return;

  tasksContainer.innerHTML = "";

  let filtered = tasks;

  if (taskFilter !== "all") {
    filtered = tasks.filter((t) => t.status === taskFilter);
  }

  if (currentView === "my") {
    filtered = filtered.filter((t) => !t.supervisor);
  } else {
    filtered = filtered.filter((t) => t.supervisor);
  }

  // COUNTS
  let pending = tasks.filter((t) => t.status === "pending").length;
  let progress = tasks.filter((t) => t.status === "progress").length;
  let done = tasks.filter((t) => t.status === "done").length;

  document.getElementById("pending-count").textContent = pending;
  document.getElementById("progress-count").textContent = progress;
  document.getElementById("done-count").textContent = done;

  // RENDER
  filtered.forEach((t) => {
    const isLate =
      t.deadline && new Date(t.deadline) < new Date() && t.status !== "done";
    const realIndex = tasks.indexOf(t);

    tasksContainer.innerHTML += `
      <div class="task-item">

        <div class="task-dot ${t.status}"></div>

        <div class="task-content">
          <h4 class="${t.status === "done" ? "done-text" : ""}">
            ${t.title}
          </h4>
          <p>${t.desc || ""}</p>
         <div class="task-meta ${isLate ? "late" : ""}">
  📅 ${t.deadline ? t.deadline : "No deadline"}
</div>
        </div>

       <div class="task-actions">
  <select onchange="changeStatus(${realIndex}, this.value)">
    <option value="pending" ${t.status === "pending" ? "selected" : ""}>Pending</option>
    <option value="progress" ${t.status === "progress" ? "selected" : ""}>In Progress</option>
    <option value="done" ${t.status === "done" ? "selected" : ""}>Done</option>
  </select>

  <button onclick="editTask(${realIndex})">✏️</button>

  <button class="check-btn" onclick="markDone(${realIndex})">✓</button>
  <button class="delete-btn small" onclick="deleteTask(${realIndex})">✕</button>
</div>

      </div>
    `;
  });
}

// ===== TASK FUNCTIONS =====
function changeStatus(i, value) {
  fetch("../api/update_task.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `id=${tasks[i].id}&status=${value}`,
  }).then(() => {
    loadTasks();
  });
}
function markDone(i) {
  fetch("../api/update_task.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `id=${tasks[i].id}&status=done`,
  }).then(() => {
    loadTasks();
  });
}
function editTask(i) {
  const t = tasks[i];

  document.getElementById("task-title").value = t.title;
  document.getElementById("task-desc").value = t.desc || "";
  document.getElementById("task-deadline").value = t.deadline || "";
  document.getElementById("task-status").value = t.status;

  editTaskIndex = i;

  document.getElementById("task-modal")?.classList.remove("hidden");
  document.querySelector("#task-modal h3").innerText = "Edit Task";
}

let deleteTaskIndex = null;

function deleteTask(i) {
  deleteTaskIndex = i;
  document.getElementById("task-delete-modal")?.classList.remove("hidden");
}

document
  .getElementById("confirm-task-delete")
  ?.addEventListener("click", function () {
    if (deleteTaskIndex !== null) {
      fetch("../api/delete_task.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `id=${tasks[deleteTaskIndex].id}`,
      }).then(() => {
        loadTasks();
      });

      closeTaskDeleteModal();
      deleteTaskIndex = null;
    }
  });

if (tasksContainer) {
  loadTasks();
}

// ================= SUPERVISOR SEARCH =================

const container = document.getElementById("supervisors-container");
const searchInput = document.getElementById("searchInput");
function renderSupervisors(list) {
  if (!container) return;

  container.innerHTML = "";

  list.forEach((s) => {
    const initials = s.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2);

    container.innerHTML += `
      <div class="file-card">

        <div class="sup-header">
          <div class="avatar">${initials}</div>

          <div>
            <div class="file-name">Dr. ${s.name}</div>
            <div class="file-info">${s.field}</div>
          </div>
        </div>

        <span class="file-status ${s.available ? "done" : "not-sent"}">
          ${s.available ? "Available" : "Not Available"}
        </span>

        ${
          s.available
            ? `<button class="send-btn"
                 onclick="openRequestModal('${s.name}', this, '${s.field}')">
                 Request Supervision
               </button>`
            : ""
        }

      </div>
    `;
  });
}
let selectedSupervisor = "";
let currentButton = null;
function openRequestModal(name, btn, field) {
  selectedSupervisor = name;
  currentButton = btn;

  document.getElementById("selectedSupervisor").innerText = "Dr. " + name;
  document.getElementById("modalField").innerText = field;

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  document.getElementById("modalAvatar").innerText = initials;

  document.getElementById("requestModal").classList.remove("hidden");
}
function closeRequestModal() {
  document.getElementById("requestModal").classList.add("hidden");
}
function sendRequest() {
  const msg = document.getElementById("requestMessage").value;

  if (!msg.trim()) {
    alert("Write a message first ⚠️");
    return;
  }

  alert("Request sent to " + selectedSupervisor + " ✅");

  if (currentButton) {
    currentButton.innerText = "Requested ✅";
    currentButton.disabled = true;
  }

  document.getElementById("requestMessage").value = "";

  closeRequestModal();
}
if (searchInput) {
  searchInput.addEventListener("keyup", () => {
    const value = searchInput.value.toLowerCase();
    const filtered = supervisors.filter((s) =>
      s.name.toLowerCase().includes(value),
    );
    renderSupervisors(filtered);
  });
}
let supervisors = [];

fetch("../api/get_supervisors.php")
  .then((res) => res.json())
  .then((data) => {
    supervisors = data;
    renderSupervisors(supervisors);
  });
if (container) {
  renderSupervisors(supervisors);
}
const myTab = document.getElementById("my-tab");
const supTab = document.getElementById("sup-tab");

if (myTab && supTab) {
  myTab.addEventListener("click", () => {
    currentView = "my";

    myTab.classList.add("active");
    supTab.classList.remove("active");

    loadTasks();
  });

  supTab.addEventListener("click", () => {
    currentView = "supervisor";

    supTab.classList.add("active");
    myTab.classList.remove("active");

    loadTasks();
  });
}
function filterTasks(type) {
  taskFilter = type;
  loadTasks();
}
if (document.body.classList.contains("profile-page")) {
  const editBtn = document.getElementById("editBtn");
  const saveBtn = document.getElementById("saveBtn");

  const inputs = document.querySelectorAll("input");

  editBtn.onclick = () => {
    inputs.forEach((i) => (i.disabled = false));
    saveBtn.classList.remove("hidden");
  };

  saveBtn.onclick = () => {
    inputs.forEach((i) => (i.disabled = true));
    saveBtn.classList.add("hidden");

    document.getElementById("displayName").innerText =
      document.getElementById("name").value || "Your Name";

    document.getElementById("displayField").innerText =
      document.getElementById("field").value || "Your Field";

    document.getElementById("displayId").innerText =
      document.getElementById("studentId").value || "--";

    document.getElementById("displayProgram").innerText =
      document.getElementById("field").value || "--";

    document.getElementById("displayDate").innerText =
      document.getElementById("date").value || "--";

    let name = document.getElementById("name").value;
    if (name) {
      document.getElementById("avatar").innerText = name
        .split(" ")
        .map((n) => n[0])
        .join("");
    }
  };
}
// ===== USER MENU =====
const userToggle = document.getElementById("userToggle");
const userDropdown = document.getElementById("userDropdown");

if (userToggle) {
  userToggle.onclick = () => {
    userDropdown.classList.toggle("hidden");
  };
}

// ===== MODAL LOGIC =====
const modal = document.getElementById("confirmModal");
const modalText = document.getElementById("modalText");
const confirmBtn = document.getElementById("confirmBtn");
const cancelBtn = document.getElementById("cancelBtn");

const logoutBtn = document.getElementById("logoutBtn");
const deleteBtn = document.getElementById("deleteBtn");

let action = "";

// LOGOUT
if (logoutBtn) {
  logoutBtn.onclick = () => {
    modal.classList.remove("hidden");
    modalText.innerText = "Are you sure you want to logout?";
    confirmBtn.innerText = "Logout";
    action = "logout";
  };
}

// DELETE
if (deleteBtn) {
  deleteBtn.onclick = () => {
    modal.classList.remove("hidden");
    modalText.innerText = "Delete your account permanently?";
    confirmBtn.innerText = "Delete";
    action = "delete";
  };
}

// CANCEL
if (cancelBtn) {
  cancelBtn.onclick = () => {
    modal.classList.add("hidden");
  };
}

// CONFIRM
if (confirmBtn) {
  confirmBtn.onclick = () => {
    if (action === "logout") {
      window.location.href = "login.html";
    }

    if (action === "delete") {
      localStorage.removeItem("user");
      window.location.href = "login.html";
    }

    modal.classList.add("hidden");
  };
}
// ===== MESSAGES =====

const messageView = document.getElementById("message-view");

let messages = [];

fetch("../api/get_messages.php")
  .then((res) => res.json())
  .then((data) => {
    messages = data;
    renderInbox();
  });
const user = JSON.parse(localStorage.getItem("user"));
function renderInbox() {
  const container = document.getElementById("messages-list");
  if (!container) return;

  document.querySelector(".messages-container")?.classList.remove("single");

  container.innerHTML = "";

  const inboxMsgs = messages.filter((m) => m.to === user.name);

  const senders = [...new Set(inboxMsgs.map((m) => m.from))];

  senders.forEach((name) => {
    const lastMsg = inboxMsgs.filter((m) => m.from === name).slice(-1)[0];

    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2);

    container.innerHTML += `
      <div class="message-row" onclick="openConversation('${name}')">

        <div class="avatar">${initials}</div>

        <div class="msg-content">
          <div class="msg-title">
            <strong>${name}</strong>
            <span class="msg-date">${lastMsg.date}</span>
          </div>

          <div class="msg-subject">${lastMsg.subject || "No subject"}</div>
          <div class="msg-text">${lastMsg.content.slice(0, 60)}...</div>
        </div>

        <span class="msg-status">Seen</span>

      </div>
    `;
  });
}
function openConversation(otherUser) {
  const container = document.querySelector(".messages-container");
  container.classList.add("single");

  const convo = messages.filter(
    (m) =>
      (m.from === user.name && m.to === otherUser) ||
      (m.from === otherUser && m.to === user.name),
  );

  const lastMsg = convo[convo.length - 1];

  document.getElementById("message-view").innerHTML = `
    <div class="message-form">

      <span onclick="goBack()" class="back-btn">
        ← Back to Messages
      </span>

      <h3>Message</h3>

      <div class="form-body">

        <label>From</label>
        <input value="${lastMsg.from}" disabled>

        <label>To</label>
        <input value="${lastMsg.to}" disabled>

        <label>Subject</label>
        <input value="${lastMsg.subject || ""}" disabled>

        <label>Message</label>
        <textarea disabled>${lastMsg.content}</textarea>

      </div>

    </div>
  `;
}
function replyTo(userEmail) {
  openMsgForm();

  document.getElementById("msg-to").value = userEmail;
}
function goBack() {
  const container = document.querySelector(".messages-container");

  container.classList.remove("single");

  document.getElementById("message-view").innerHTML = "";
}
function sendReply(toUser) {
  const text = document.getElementById("replyText").value;

  if (!text.trim()) return;

  fetch("../api/send_message.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `to=${encodeURIComponent(toUser)}&content=${encodeURIComponent(text)}`,
  }).then(() => {
    location.reload();
  });
}
function openMsgForm() {
  document.getElementById("new-message-form")?.classList.remove("hidden");
  document.querySelector(".messages-container")?.classList.add("hidden");
}

function closeMsgForm() {
  document.getElementById("new-message-form")?.classList.add("hidden");
  document.querySelector(".messages-container")?.classList.remove("hidden");
}
window.addEventListener("beforeunload", () => {
  document.querySelectorAll(".modal").forEach((m) => m.classList.add("hidden"));
});
// ================= MESSAGES FIX =================

if (document.body.classList.contains("messages-page")) {
  const inboxTab = document.getElementById("inbox-tab");
  const sentTab = document.getElementById("sent-tab");
  function renderSent() {
    const container = document.getElementById("messages-list");
    if (!container) return;

    document.querySelector(".messages-container")?.classList.remove("single");

    container.innerHTML = "";

    const sentMsgs = messages.filter((m) => m.from === user.name);

    const receivers = [...new Set(sentMsgs.map((m) => m.to))];

    receivers.forEach((name) => {
      const lastMsg = sentMsgs.filter((m) => m.to === name).slice(-1)[0];

      const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2);

      container.innerHTML += `
      <div class="message-row" onclick="openConversation('${name}')">

        <div class="avatar">${initials}</div>

        <div class="msg-content">
          <div class="msg-title">
            <strong>${name}</strong>
            <span class="msg-date">${lastMsg.date}</span>
          </div>

          <div class="msg-subject">
            ${lastMsg.subject || "No subject"}
          </div>

          <div class="msg-text">
            ${lastMsg.content.slice(0, 60)}...
          </div>
        </div>

        <span class="msg-status">Sent</span>

      </div>
    `;
    });
  }

  // TAB SWITCH
  if (inboxTab && sentTab) {
    inboxTab.onclick = () => {
      inboxTab.classList.add("active");
      sentTab.classList.remove("active");
      renderInbox();
    };

    sentTab.onclick = () => {
      sentTab.classList.add("active");
      inboxTab.classList.remove("active");
      renderSent();
    };
  }

  // SEND NEW MESSAGE
  window.sendNewMessage = function () {
    const toInput = document.getElementById("msg-to");
    const subjectInput = document.getElementById("msg-subject");
    const contentInput = document.getElementById("msg-content");

    if (!toInput.value || !contentInput.value) return;

    fetch("../api/send_message.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `to=${encodeURIComponent(toInput.value)}&subject=${encodeURIComponent(subjectInput.value)}&content=${encodeURIComponent(contentInput.value)}`,
    }).then(() => {
      closeMsgForm();
      location.reload();
    });
  };

  renderInbox();
}
function createMessageRow(m, isSent = false) {
  const name = isSent ? m.to : m.from;

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return `
    <div class="message-row">

      <div class="avatar">${initials}</div>

      <div class="msg-content">
        <div class="msg-title">
          <strong>${name}</strong>
          <span class="msg-date">${m.date}</span>
        </div>

        <div class="msg-subject">
          ${m.subject || "No subject"}
        </div>

        <div class="msg-text">
          ${m.content.slice(0, 60)}...
        </div>
      </div>

      <span class="msg-status">
        ${isSent ? "Sent" : m.seen ? "Seen" : "New"}
      </span>

    </div>
  `;
}
(function () {
  document.addEventListener("DOMContentLoaded", () => {
    if (document.body.classList.contains("dashboard-page")) {
      fetch("../api/student_dashboard.php")
        .then((res) => res.json())
        .then((data) => {
          // USER
          document.getElementById("username").textContent = data.user.name;

          // PROJECT
          document.getElementById("projectTitle").textContent =
            data.project.title;
          document.getElementById("supervisor").textContent =
            "Supervised by " + data.project.supervisor;
          document.getElementById("projectStatus").textContent =
            data.project.status;

          // TASKS
          const tasksBox = document.getElementById("tasks");
          tasksBox.innerHTML = "";

          data.tasks.forEach((t) => {
            tasksBox.innerHTML += `
          <div class="task">
            <div class="task-left">
              <p class="task-title">${t.title}</p>
            </div>
            <div class="task-right">
              <span class="task-date">${t.deadline || ""}</span>
              <span class="status ${t.status}">${t.status}</span>
            </div>
          </div>
        `;
          });

          document.getElementById("taskCount").textContent =
            data.tasks.length + " tasks";

          // FILES
          const filesBox = document.getElementById("files");
          filesBox.innerHTML = "";

          data.files.forEach((f) => {
            filesBox.innerHTML += `
          <div class="file">
            <div class="file-left">
              <div class="file-icon">📄</div>
              <div>
                <p class="file-name">${f.name}</p>
              </div>
            </div>
            <span class="status ${f.status}">${f.status}</span>
          </div>
        `;
          });

          // NOTIFICATIONS
          const notifBox = document.getElementById("notifications");
          notifBox.innerHTML = "";

          document.getElementById("notifCount").textContent =
            data.notifications.length;

          data.notifications.forEach((n) => {
            notifBox.innerHTML += `
          <div class="notif">
            <span>🔔</span>
            <span>${n.text}</span>
          </div>
        `;
          });
        });
    }
  });
})();
(function () {
  if (!document.body.classList.contains("notifications-page")) return;

  const user = JSON.parse(localStorage.getItem("user"));

  const storageKey = user
    ? "notifications_" + user.name
    : "notifications_default";

  let data = JSON.parse(localStorage.getItem(storageKey)) || [];

  localStorage.setItem(storageKey, JSON.stringify(data));

  let current = "all";

  function addNotification(notif) {
    data.unshift(notif);

    localStorage.setItem(storageKey, JSON.stringify(data));

    render();
  }

  function getIcon(type) {
    if (type === "review") return "fa-check";
    if (type === "feedback") return "fa-comment";
    if (type === "task") return "fa-clock";
    if (type === "file") return "fa-file";
  }

  function updateCounts() {
    document.getElementById("tab-all").innerText = `All (${data.length})`;

    document.getElementById("tab-review").innerText =
      `Reviewed (${data.filter((n) => n.type === "review").length})`;

    document.getElementById("tab-feedback").innerText =
      `Feedback (${data.filter((n) => n.type === "feedback").length})`;

    document.getElementById("tab-task").innerText =
      `Tasks (${data.filter((n) => n.type === "task").length})`;
  }

  function render() {
    const list = document.getElementById("list");
    if (!list) return;

    list.innerHTML = "";

    let unread = data.filter((n) => !n.read).length;
    document.getElementById("count").innerText = unread;

    if (data.length === 0) {
      list.innerHTML = `
        <div style="text-align:center; padding:40px; color:gray;">
          No notifications yet
        </div>
      `;
      updateCounts();
      return;
    }

    data
      .filter((n) => current === "all" || n.type === current)
      .forEach((n) => {
        list.innerHTML += `
          <div class="card ${n.read ? "" : "unread"}">
            <div class="left">
              <div class="icon ${n.type}">
                <i class="fa ${getIcon(n.type)}"></i>
              </div>
              <div>
                <strong>${n.text}</strong>
                <div class="time">${n.time || ""}</div>
              </div>
            </div>

            ${
              !n.read
                ? `
              <button class="btn-read" onclick="readNotif('${n.id}')">
                Mark read
              </button>
            `
                : ""
            }
          </div>
        `;
      });

    updateCounts();
  }

  function readNotif(id) {
    data = data.map((n) => (n.id === id ? { ...n, read: true } : n));

    localStorage.setItem(storageKey, JSON.stringify(data));

    render();
  }

  function markAllRead() {
    data.forEach((n) => (n.read = true));

    localStorage.setItem(storageKey, JSON.stringify(data));

    render();
  }

  function filter(type) {
    current = type;

    document
      .querySelectorAll(".message-tabs button")
      .forEach((btn) => btn.classList.remove("active"));

    document.getElementById("tab-" + type).classList.add("active");

    render();
  }

  window.markAllRead = markAllRead;
  window.filter = filter;
  window.readNotif = readNotif;

  render();
})();
loadFiles();
