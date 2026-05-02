window.openAddModal = function () {
  document.getElementById("modal").classList.remove("hidden");
};
let searchQuery = "";
window.closeModal = function () {
  document.getElementById("modal").classList.add("hidden");
  document.getElementById("project-form").reset();

  const list = document.getElementById("students-list");
  list.innerHTML = `
    <div class="student-row">
      <input type="text" placeholder="Student Name" class="student-name" />
      <input type="email" placeholder="Student Email" class="student-email" />
    </div>
  `;
};
let deleteIndex = null;
document.addEventListener("DOMContentLoaded", () => {
  let projects = [];

  fetch("../api/get_projects.php")
    .then((res) => res.json())
    .then((data) => {
      projects = data;
      renderProjects();
    });
  const container = document.getElementById("projects-container");
  const emptyState = document.getElementById("empty-state");

  window.renderProjects = function () {
    container.innerHTML = "";

    if (projects.length === 0) {
      emptyState.style.display = "block";
      return;
    }

    emptyState.style.display = "none";

    projects.forEach((p, index) => {
      container.innerHTML += `
       <div class="project-card" onclick="openProject(${index})">
          <div class="project-left">
            <div class="avatars">
             ${(p.students || [])
               .map(
                 (s) => `
  <div class="avatar">${s.name.charAt(0).toUpperCase()}</div>
`,
               )
               .join("")}
            </div>

            <div>
              <h4>${p.title}</h4>
<p>${(p.students || []).map((s) => s.name).join(", ")}</p>            </div>
          </div>
<div>
  <select 
    class="status ${p.status}" 
    onclick="event.stopPropagation()" 
    onchange="changeStatus(${index}, this.value)"
  >
    <option value="in-progress" ${p.status === "in-progress" ? "selected" : ""}>In Progress</option>
    <option value="reviewed" ${p.status === "reviewed" ? "selected" : ""}>Reviewed</option>
    <option value="completed" ${p.status === "completed" ? "selected" : ""}>Completed</option>
  </select>

  <button class="delete-btn" onclick="event.stopPropagation(); deleteProject(${index})">✕</button>
</div>
      `;
    });

    updateStats();
  };

  function updateStats() {
    document.getElementById("total-count").textContent = projects.length;
    document.getElementById("progress-count").textContent = projects.filter(
      (p) => p.status === "in-progress",
    ).length;
    document.getElementById("reviewed-count").textContent = projects.filter(
      (p) => p.status === "reviewed",
    ).length;
    document.getElementById("completed-count").textContent = projects.filter(
      (p) => p.status === "completed",
    ).length;
  }

  const form = document.getElementById("project-form");

  if (form) {
    form.addEventListener("submit", function (e) {
      console.log("ADD CLICKED ");
      e.preventDefault();

      const names = document.querySelectorAll(".student-name");
      const emails = document.querySelectorAll(".student-email");

      let students = [];

      for (let i = 0; i < names.length; i++) {
        if (names[i].value.trim() !== "" && emails[i].value.trim() !== "") {
          students.push({
            name: names[i].value,
            email: emails[i].value,
          });
        }
      }

      if (students.length === 0) {
        alert("Add at least one student");
        return;
      }
      const title = document.getElementById("project-title").value.trim();

      if (title === "") {
        alert("Project title is required");
        return;
      }
      fetch("../api/profile.php")
        .then((res) => res.json())
        .then((user) => {
          const newProject = {
            title: title,
            students,
            status: document.getElementById("project-status").value,
            supervisorId: user.id,
          };
          fetch("../api/add_project.php", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: `title=${encodeURIComponent(title)}&status=${document.getElementById("project-status").value}`,
          }).then(() => location.reload());
          closeModal();
          form.reset();
          document.getElementById("name").value = user.name || "";
          document.getElementById("email").value = user.email || "";

          document.getElementById("displayName").innerText =
            user.name || "Your Name";

          if (user.name) {
            const initials = user.name
              .split(" ")
              .map((n) => n[0])
              .join("");
            document.getElementById("avatar").innerText = initials;
            document.getElementById("miniAvatar").innerText = initials;
            document.getElementById("miniName").innerText = user.name;
          }
        });

      const openBtn = document.getElementById("open-modal-btn");

      if (openBtn) {
        openBtn.addEventListener("click", () => window.openAddModal());
      }
      renderProjects();
      document.getElementById("project-title").addEventListener("input", () => {
        console.log("typing...");
      });

      document
        .getElementById("confirm-delete")
        .addEventListener("click", () => {
          if (clearMode) {
            localStorage.removeItem("projects");
            location.reload();
            return;
          }

          if (deleteIndex === null) return;
          fetch("../api/delete_project.php", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: `id=${projects[deleteIndex].id}`,
          }).then(() => location.reload());
          closeDeleteModal();

          deleteIndex = null;
        });

      if (document.getElementById("tasks-container")) {
        renderTasks();
      }

      deleteIndex = null;

      // ===== ADD STUDENT =====
      window.addStudent = function () {
        const container = document.getElementById("students-list");

        const div = document.createElement("div");
        div.className = "student-row";

        div.innerHTML = `
    <input type="text" placeholder="Student Name" class="student-name" />
    <input type="email" placeholder="Student Email" class="student-email" />

    <button type="button" class="remove-btn" onclick="this.parentElement.remove()">✕</button>
  `;

        container.appendChild(div);
      };

      // ===== CHANGE STATUS =====
      window.changeStatus = function (index, newStatus) {
        fetch("../api/update_project.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: `id=${projects[index].id}&status=${newStatus}`,
        }).then(() => location.reload());
      };
      window.deleteProject = function (index) {
        deleteIndex = index;
        document.getElementById("delete-modal").classList.remove("hidden");
      };
      window.closeDeleteModal = function () {
        document.getElementById("delete-modal").classList.add("hidden");
      };
      let clearMode = false;
      window.clearAll = function () {
        clearMode = true;
        document.getElementById("delete-modal").classList.remove("hidden");
      };
      window.openProject = function (index) {
        localStorage.setItem("selectedProject", index);
        window.location.href = "project-details.html";
      };
      document.addEventListener("DOMContentLoaded", () => {
        const index = localStorage.getItem("selectedProject");

        if (document.getElementById("project-title")) {
          const index = localStorage.getItem("selectedProject");

          const project = projects[index];

          if (project) {
            document.getElementById("project-title").textContent =
              project.title;

            document.getElementById("students").textContent =
              "Supervised by " + project.students.map((s) => s.name).join(", ");

            document.getElementById("project-status").textContent =
              project.status;
          }
        }
      });
      // ===== TASK MODAL =====
      window.openTaskModal = function () {
        document.getElementById("task-modal").classList.remove("hidden");
      };

      window.closeTaskModal = function () {
        document.getElementById("task-modal").classList.add("hidden");
      };

      // ===== ADD TASK =====
      window.addTask = function () {
        const title = document.getElementById("task-title").value.trim();
        const deadline = document.getElementById("task-deadline").value;
        const notes = document.getElementById("task-notes").value.trim();

        if (!title || !deadline) {
          alert("Fill all fields");
          return;
        }

        let projects = JSON.parse(localStorage.getItem("projects")) || [];
        let index = localStorage.getItem("selectedProject");

        if (!projects[index].tasks) {
          projects[index].tasks = [];
        }

        if (editingTaskIndex !== null) {
          // ✏️ EDIT
          projects[index].tasks[editingTaskIndex] = {
            title,
            deadline,
            notes,
            status: "pending",
          };

          editingTaskIndex = null;
        } else {
          // ➕ ADD
          projects[index].tasks.push({
            title,
            deadline,
            notes,
            status: "pending",
          });
        }

        localStorage.setItem("projects", JSON.stringify(projects));

        renderTasks();
        closeTaskModal();

        // reset inputs
        document.getElementById("task-title").value = "";
        document.getElementById("task-deadline").value = "";
        document.getElementById("task-notes").value = "";
      };

      // ===== RENDER TASKS =====
      function renderTasks() {
        const container = document.getElementById("tasks-container");
        if (!container) return;

        let projects = JSON.parse(localStorage.getItem("projects")) || [];
        let index = localStorage.getItem("selectedProject");

        const project = projects[index];

        container.innerHTML = ""; // مهم

        if (!project.tasks || project.tasks.length === 0) {
          container.innerHTML = "<p>No tasks yet.</p>";
          return;
        }

        project.tasks.forEach((t, i) => {
          container.innerHTML += `
      <div class="file-card">
        <div class="file-info">
          <span class="file-name">${t.title}</span>
          <span class="file-meta">Deadline: ${t.deadline}</span>
          ${t.notes ? `<span class="file-meta">${t.notes}</span>` : ""}
        </div>

        <div class="file-actions">
  <span class="file-status">${t.status}</span>

  <button onclick="editTask(${i})" class="icon-btn">
    <i class="fa fa-pen"></i>
  </button>

  <button onclick="deleteTask(${i})" class="icon-btn danger">
    <i class="fa fa-trash"></i>
  </button>
</div>
      </div>
    `;
        });
      }
      window.deleteTask = function (taskIndex) {
        let projects = JSON.parse(localStorage.getItem("projects")) || [];
        let index = localStorage.getItem("selectedProject");

        projects[index].tasks.splice(taskIndex, 1);

        localStorage.setItem("projects", JSON.stringify(projects));

        renderTasks();
      };
      let editingTaskIndex = null;

      window.editTask = function (taskIndex) {
        let projects = JSON.parse(localStorage.getItem("projects")) || [];
        let index = localStorage.getItem("selectedProject");

        const task = projects[index].tasks[taskIndex];

        document.getElementById("task-title").value = task.title;
        document.getElementById("task-deadline").value = task.deadline;
        document.getElementById("task-notes").value = task.notes;

        editingTaskIndex = taskIndex;

        openTaskModal();
      };
      window.goBackToProjects = function () {
        window.location.href = "projects.html";
      };
      document.addEventListener("DOMContentLoaded", () => {
        if (document.body.classList.contains("files-prof-page")) {
          renderFilesProf();
        }
      });
      // ===== RENDER FILES FOR SUPERVISOR =====
      function renderFilesProf() {
        const container = document.getElementById("files-container");
        const empty = document.getElementById("empty-state");

        if (!container) return;

        let projects = JSON.parse(localStorage.getItem("projects")) || [];

        let allFiles = [];

        // ✅ جمع الملفات من كل المشاريع
        projects.forEach((p) => {
          if (p.files) {
            p.files.forEach((f) => {
              allFiles.push({
                ...f,
                project: p.title,
                student: (p.students || []).map((s) => s.name).join(", "),
              });
            });
          }
        });

        if (currentFilter !== "all") {
          allFiles = allFiles.filter((f) => f.status === currentFilter);
        }
        // 🔍 SEARCH FILTER
        if (searchQuery) {
          allFiles = allFiles.filter(
            (f) =>
              f.name.toLowerCase().includes(searchQuery) ||
              f.project.toLowerCase().includes(searchQuery),
          );
        }
        container.innerHTML = "";

        if (allFiles.length === 0) {
          empty.style.display = "block";
          return;
        }

        empty.style.display = "none";

        // ✅ render
        allFiles.forEach((f) => {
          container.innerHTML += `
<div class="file-card">
<div class="file-top" onclick="openFile('${f.name}')">          <div class="file-icon">📄</div>
<span class="file-type ${f.type.toLowerCase()}">${f.type}</span>        </div>

        <div class="file-name">${f.name}</div>

        <div class="file-info">
          <span class="file-meta">${f.date}</span>
<span class="file-meta">📁 ${f.project}</span>        </div>

        <span class="file-status ${f.status}">
          ${f.status}
        </span>

${
  f.feedback
    ? `
  <div class="file-feedback">
    <span>💬 ${f.feedback}</span>

    <div class="feedback-actions">
      <button class="icon-btn" onclick="event.stopPropagation(); editFeedback('${f.name}')">
        <i class="fa fa-pen"></i>
      </button>

      <button class="icon-btn danger" onclick="event.stopPropagation(); deleteFeedback('${f.name}')">
        <i class="fa fa-trash"></i>
      </button>
    </div>
  </div>
`
    : ""
}
<div class="file-actions">

  <button class="icon-btn" title="Feedback" onclick="event.stopPropagation(); reviewFile('${f.name}')">
    <i class="fa fa-comment"></i>
  </button>

  <button class="icon-btn" onclick="event.stopPropagation(); approveFile('${f.name}')">✔</button>

  <button class="icon-btn" onclick="event.stopPropagation(); downloadFile('${f.name}')">
  <i class="fa fa-download"></i>
</button>

  

</div>
      
    
    `;
        });
      }
      function openFile(fileName) {
        let projects = JSON.parse(localStorage.getItem("projects")) || [];

        projects.forEach((p) => {
          if (p.files) {
            p.files.forEach((f) => {
              if (f.name === fileName) {
                if (f.url) {
                  window.open(f.url, "_blank");
                } else {
                  alert("File not available");
                }
              }
            });
          }
        });
      }
      let currentFilter = "all";
      function filterFiles(status, event) {
        currentFilter = status;

        // active button
        document.querySelectorAll(".filters button").forEach((btn) => {
          btn.classList.remove("active");
        });

        event.target.classList.add("active");

        renderFilesProf();
      }
      function updateFileStatus(fileName, newStatus) {
        let projects = JSON.parse(localStorage.getItem("projects")) || [];

        projects.forEach((p) => {
          if (p.files) {
            p.files.forEach((f) => {
              if (f.name === fileName) {
                f.status = newStatus;
              }
            });
          }
        });

        localStorage.setItem("projects", JSON.stringify(projects));
        renderFilesProf();
      }

      function approveFile(fileName) {
        updateFileStatus(fileName, "approved");
      }
      let currentFile = null;
      function reviewFile(fileName) {
        currentFile = fileName;

        let projects = JSON.parse(localStorage.getItem("projects")) || [];

        let oldFeedback = "";

        projects.forEach((p) => {
          if (p.files) {
            p.files.forEach((f) => {
              if (f.name === fileName) {
                oldFeedback = f.feedback || "";
              }
            });
          }
        });

        document.getElementById("feedback-input").value = oldFeedback;

        document.getElementById("feedback-modal").classList.remove("hidden");
      }
      function closeFeedback() {
        document.getElementById("feedback-modal").classList.add("hidden");
        document.getElementById("feedback-input").value = "";
      }
      function submitFeedback() {
        const feedback = document.getElementById("feedback-input").value.trim();

        if (!feedback) return;

        let projects = JSON.parse(localStorage.getItem("projects")) || [];

        projects.forEach((p) => {
          if (p.files) {
            p.files.forEach((f) => {
              if (f.name === currentFile) {
                f.status = "reviewed";
                f.feedback = feedback;
              }
            });
          }
        });

        localStorage.setItem("projects", JSON.stringify(projects));

        closeFeedback();
        renderFilesProf();
      }
      function downloadFile(fileName) {
        let projects = JSON.parse(localStorage.getItem("projects")) || [];

        projects.forEach((p) => {
          if (p.files) {
            p.files.forEach((f) => {
              if (f.name === fileName && f.url) {
                const a = document.createElement("a");
                a.href = f.url;
                a.download = f.name;
                a.click();
              }
            });
          }
        });
      }
      const searchInput = document.getElementById("search");

      if (searchInput) {
        searchInput.addEventListener("input", (e) => {
          searchQuery = e.target.value.toLowerCase();
          renderFilesProf();
        });
      }
      function deleteFeedback(fileName) {
        let projects = JSON.parse(localStorage.getItem("projects")) || [];

        projects.forEach((p) => {
          if (p.files) {
            p.files.forEach((f) => {
              if (f.name === fileName) {
                delete f.feedback;
                f.status = "sent";
              }
            });
          }
        });

        localStorage.setItem("projects", JSON.stringify(projects));
        renderFilesProf();
      }
      function editFeedback(fileName) {
        currentFile = fileName;

        let projects = JSON.parse(localStorage.getItem("projects")) || [];

        let oldFeedback = "";

        projects.forEach((p) => {
          if (p.files) {
            p.files.forEach((f) => {
              if (f.name === fileName) {
                oldFeedback = f.feedback || "";
              }
            });
          }
        });

        document.getElementById("feedback-input").value = oldFeedback;

        document.getElementById("feedback-modal").classList.remove("hidden");
      }
      // ================= SAFE INIT =================
      document.addEventListener("DOMContentLoaded", () => {
        // ===== ELEMENTS =====
        const editBtn = document.getElementById("editBtn");
        const saveBtn = document.getElementById("saveBtn");
        const inputs = document.querySelectorAll(
          ".profile-page input, .profile-page select",
        );
        const statusSelect = document.getElementById("status");

        const userToggle = document.getElementById("userToggle");
        const userDropdown = document.getElementById("userDropdown");

        const modal = document.getElementById("confirmModal");
        const confirmBtn = document.getElementById("confirmBtn");
        const cancelBtn = document.getElementById("cancelBtn");
        const modalText = document.getElementById("modalText");

        const deleteBtn = document.getElementById("deleteBtn");
        const logoutBtn = document.getElementById("logoutBtn");

        let currentAction = "";

        // ================= EDIT =================
        if (editBtn && saveBtn) {
          editBtn.onclick = () => {
            inputs.forEach((i) => (i.disabled = false));
            saveBtn.classList.remove("hidden");
          };

          saveBtn.onclick = () => {
            let isValid = true;

            const idInput = document.getElementById("supervisorId");
            const phoneInput = document.getElementById("phone");

            // VALIDATION
            if (idInput && idInput.value.length < 8) {
              idInput.classList.add("error");
              isValid = false;
            } else if (idInput) {
              idInput.classList.remove("error");
            }

            if (phoneInput && !/^[0-9]+$/.test(phoneInput.value)) {
              phoneInput.classList.add("error");
              isValid = false;
            } else if (phoneInput) {
              phoneInput.classList.remove("error");
            }

            if (!isValid) {
              showError("Please fix the highlighted fields ⚠️");
              return;
            }

            // DISABLE AGAIN
            inputs.forEach((i) => (i.disabled = true));
            saveBtn.classList.add("hidden");

            // UPDATE DISPLAY
            const name = document.getElementById("name")?.value || "";
            const field = document.getElementById("field")?.value || "";

            document.getElementById("displayName").innerText =
              name || "Your Name";
            document.getElementById("displayField").innerText =
              field || "Your Field";
            document.getElementById("displayId").innerText =
              idInput?.value || "--";
            document.getElementById("displayDept").innerText =
              document.getElementById("department")?.value || "--";

            const displayStatus = document.getElementById("displayStatus");
            displayStatus.innerText = statusSelect?.value || "--";

            // STATUS COLOR
            if (statusSelect?.value === "Available") {
              displayStatus.className = "available-text";
            } else if (statusSelect?.value === "Not Available") {
              displayStatus.className = "not-available-text";
            } else {
              displayStatus.className = "";
            }

            // AVATAR
            if (name) {
              const initials = name
                .split(" ")
                .map((n) => n[0])
                .join("");

              document.getElementById("avatar").innerText = initials;
              document.getElementById("miniAvatar").innerText = initials;
              document.getElementById("miniName").innerText = name;
            }
            fetch("../api/update_profile.php", {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: `name=${encodeURIComponent(name)}`,
            })
              .then((res) => res.text())
              .then(() => {
                if (document.body.classList.contains("prof-page")) {
                  window.location.href = "Dashboard-prof.html";
                } else {
                  window.location.href = "dashboard-student.html";
                }
              });
          };
        }

        // ================= STATUS STYLE =================
        if (statusSelect) {
          statusSelect.onchange = () => {
            if (statusSelect.value === "Available") {
              statusSelect.style.color = "#4caf50";
            } else if (statusSelect.value === "Not Available") {
              statusSelect.style.color = "#e74c3c";
            } else {
              statusSelect.style.color = "#333";
            }
          };
        }

        // ================= DROPDOWN =================
        if (userToggle && userDropdown) {
          userToggle.onclick = () => {
            userDropdown.classList.toggle("hidden");
          };

          document.addEventListener("click", (e) => {
            if (
              !userToggle.contains(e.target) &&
              !userDropdown.contains(e.target)
            ) {
              userDropdown.classList.add("hidden");
            }
          });
        }

        // ================= MODAL =================
        if (modal && confirmBtn && cancelBtn) {
          if (deleteBtn && modal) {
            deleteBtn.onclick = (e) => {
              e.stopPropagation();
              modal.classList.remove("hidden");
              modalText.innerText = "Delete your account?";
              confirmBtn.innerText = "Delete";
              currentAction = "delete";
            };
          }
          if (logoutBtn) {
            logoutBtn.onclick = () => {
              modal.classList.remove("hidden");
              modalText.innerText = "Logout?";
              confirmBtn.innerText = "Logout";
              currentAction = "logout";
            };
          }

          cancelBtn.onclick = () => {
            modal.classList.add("hidden");
          };

          confirmBtn.onclick = () => {
            if (currentAction === "delete") {
              document
                .querySelectorAll(".profile-page input")
                .forEach((i) => (i.value = ""));
              window.location.href = "login.html";
            }

            if (currentAction === "logout") {
              window.location.href = "login.html";
            }

            modal.classList.add("hidden");
          };
        }
      });
      window.addEventListener("load", () => {
        const modal = document.getElementById("confirmModal");
        if (modal) modal.classList.add("hidden");
      });
      function showError(message) {
        const modal = document.getElementById("confirmModal");
        const modalText = document.getElementById("modalText");
        const confirmBtn = document.getElementById("confirmBtn");

        modal.classList.remove("hidden");
        modalText.innerText = message;

        confirmBtn.style.display = "none";
      }
      fetch("../api/profile.php")
        .then((res) => res.json())
        .then((user) => {
          const idInput = document.getElementById("supervisorId");
          const idDisplay = document.getElementById("displayId");

          if (idInput) idInput.value = user.user_code;
          if (idDisplay) idDisplay.innerText = user.user_code;

          const allProjects =
            JSON.parse(localStorage.getItem("projects")) || [];
          const projects = allProjects.filter((p) => p.supervisorId == user.id);
          let allFiles = [];

          const label = {
            "in-progress": "In Progress",
            reviewed: "Reviewed",
            completed: "Completed",
          };

          projects.forEach((p) => {
            if (p.files) {
              p.files.forEach((f) => {
                allFiles.push(f);
              });
            }
          });

          const notifications = (
            JSON.parse(localStorage.getItem("notifications")) || []
          ).filter((n) => n.userId == user.id);

          const projectList = document.getElementById("projectsList");

          if (!projectList) return;

          projectList.innerHTML = "";

          // 👤 USER
          document.getElementById("userName").innerText =
            user.name || "No Name";
          document.getElementById("profName").innerText =
            user.name || "No Name";
          document.getElementById("dept").innerText =
            user.dept || "No Department";

          // 📊 STATS
          document.getElementById("totalProjects").innerText = projects.length;

          const progress = projects.filter(
            (p) => p.status === "in-progress",
          ).length;
          const reviewed = projects.filter(
            (p) => p.status === "reviewed",
          ).length;
          const completed = projects.filter(
            (p) => p.status === "completed",
          ).length;

          document.getElementById("progressCount").innerText =
            progress + " In Progress";
          document.getElementById("reviewedCount").innerText =
            reviewed + " Reviewed";
          document.getElementById("completedCount").innerText =
            completed + " Completed";

          // 📁 PROJECTS
          if (projects.length === 0) {
            projectList.innerHTML = "<p>No projects yet</p>";
          } else {
            projects.forEach((p) => {
              const status = p.status || "in-progress";

              projectList.innerHTML += `
          <div class="project">
            <div class="project-left">
              <div class="avatar">
                ${p.title ? p.title.charAt(0) : "?"}
              </div>

              <div class="project-info">
                <strong>${p.title}</strong>
                <p>${(p.students || []).map((s) => s.name).join(", ")}</p>
              </div>
            </div>

            <span class="status ${status}">
              ${label[status]}
            </span>
          </div>
        `;
            });
          }
        });
      // ===== PROF MESSAGES =====
      let messages = [];

      fetch("../api/get_messages.php")
        .then((res) => res.json())
        .then((data) => {
          messages = data;
          renderProfInbox();
        });
      document.addEventListener("DOMContentLoaded", () => {
        if (
          document.body.classList.contains("prof-page") &&
          document.body.classList.contains("messages-page")
        ) {
          renderProfInbox();
        }
      });
      function renderProfInbox() {
        const container = document.getElementById("profMessagesList");
        if (!container) return;

        container.innerHTML = "";

        const user = JSON.parse(localStorage.getItem("user")) || {};
        const msgs = messages.filter((m) => m.to === user.name);

        const senders = [...new Set(msgs.map((m) => m.from))];

        senders.forEach((name) => {
          const lastMsg = msgs.filter((m) => m.from === name).slice(-1)[0];

          container.innerHTML += `
<div class="prof-message-row" onclick="openMessage('${name}')">
  <div class="prof-msg-left">
      <div class="prof-msg-left">
        <div class="prof-avatar">${name[0]}</div>

        <div class="prof-msg-content">

          <div class="prof-msg-title">
            <strong>${name}</strong>
            <span class="prof-msg-date">${lastMsg.date}</span>
          </div>

          <div class="prof-msg-subject">${lastMsg.subject || "No subject"}</div>
          <div class="prof-msg-text">${lastMsg.content.slice(0, 60)}...</div>

        </div>
      </div>
</div> <!-- prof-msg-left -->

<span class="prof-msg-status">Seen</span>
     

    </div>
    `;
        });
      }
      function renderProfSent() {
        const container = document.getElementById("profMessagesList");
        if (!container) return;

        container.innerHTML = "";

        const user = JSON.parse(localStorage.getItem("user")) || {};
        const msgs = messages.filter((m) => m.from === user.name);

        msgs.forEach((m) => {
          container.innerHTML += `
<div class="prof-message-row" onclick="openMessage('${m.to}')">
      <div class="prof-msg-left">
        <div class="prof-avatar">${m.to[0]}</div>

        <div class="prof-msg-content">

          <div class="prof-msg-title">
            <strong>${m.to}</strong>
            <span class="prof-msg-date">${m.date}</span>
          </div>

          <div class="prof-msg-subject">${m.subject || "No subject"}</div>
          <div class="prof-msg-text">${m.content.slice(0, 60)}...</div>

        </div>
      </div>

      <span class="prof-msg-status">Sent</span>

    </div>
    `;
        });
      }
      function setActive(e) {
        document
          .querySelectorAll(".tabs button")
          .forEach((b) => b.classList.remove("active"));
        e.target.classList.add("active");
      }
      window.closeMessageModal = function () {
        document.getElementById("messageModal").classList.add("hidden");
      };
      window.sendNewMessage = function () {
        const to = document.getElementById("msg-to").value;
        const subject = document.getElementById("msg-subject").value;
        const content = document.getElementById("msg-content").value;

        if (!to || !content) {
          alert("Fill all fields");
          return;
        }

        const user = JSON.parse(localStorage.getItem("user")) || {};
        fetch("../api/send_message.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: `to=${encodeURIComponent(to)}&subject=${encodeURIComponent(subject)}&content=${encodeURIComponent(content)}`,
        }).then(() => {
          closeMsgForm();
          location.reload();
        });
      };

      function openMsgForm() {
        document.getElementById("new-message-form").classList.remove("hidden");
      }

      function closeMsgForm() {
        document.getElementById("new-message-form").classList.add("hidden");
      }
      function openMessage(personName) {
        const list = document.getElementById("profMessagesList");
        const view = document.getElementById("profMessageView");

        const messages = JSON.parse(localStorage.getItem("messages")) || [];
        const user = JSON.parse(localStorage.getItem("user")) || {};

        const msg = messages
          .filter(
            (m) =>
              (m.from === personName && m.to === user.name) ||
              (m.to === personName && m.from === user.name),
          )
          .slice(-1)[0];

        if (!msg) return;
        list.style.display = "none";
        view.style.display = "flex";

        view.style.flex = "1";

        view.innerHTML = `
    <div class="message-view-box">

      <span onclick="goBack()" class="back-btn">← Back to Messages</span>

      <div class="form-body">

        <h2>Message</h2>

        <label>From</label>
        <input value="${msg.from}" disabled>

        <label>To</label>
        <input value="${msg.to}" disabled>

        <label>Subject</label>
        <input value="${msg.subject}" disabled>

        <label>Message</label>
        <textarea disabled>${msg.content}</textarea>

      </div>

    </div>
  `;
      }
      function goBack() {
        const list = document.getElementById("profMessagesList");
        const view = document.getElementById("profMessageView");

        list.style.display = "block";
        view.style.display = "none";
      }
      document.body.classList.contains("notifications-page");
      document.addEventListener("DOMContentLoaded", () => {
        const buttons = document.querySelectorAll(".filter-btn");

        buttons.forEach((btn) => {
          btn.addEventListener("click", () => {
            const type = btn.dataset.type;

            buttons.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");

            showNotifications(type);
          });
        });

        updateCounts();

        document.getElementById("markAll").addEventListener("click", () => {
          let data = JSON.parse(localStorage.getItem("notifications")) || [];

          data = data.map((n) => ({
            ...n,
            read: true,
          }));

          localStorage.setItem("notifications", JSON.stringify(data));

          showNotifications("all");
        });

        showNotifications("all");
      });

      function showNotifications(type) {
        const container = document.getElementById("notificationsList");
        const data = JSON.parse(localStorage.getItem("notifications")) || [];

        container.innerHTML = "";

        const filtered = data.filter((n) => type === "all" || n.type === type);

        if (filtered.length === 0) {
          container.innerHTML =
            "<p style='text-align:center;'>No notifications yet</p>";
          return;
        }

        filtered.forEach((n) => {
          const div = document.createElement("div");

          div.innerHTML = `
      <b>${n.title || n.type}</b>
      <p>${n.message}</p>
    `;

          container.appendChild(div);
        });

        updateCounts();
      }

      function addNotification(title, message, type) {
        let notifications =
          JSON.parse(localStorage.getItem("notifications")) || [];

        notifications.push({
          title: title,
          message: message,
          type: type,
          read: false,
        });

        localStorage.setItem("notifications", JSON.stringify(notifications));
      }

      function updateCounts() {
        const data = JSON.parse(localStorage.getItem("notifications")) || [];

        const unread = data.filter((n) => !n.read);

        const allCount = unread.length;
        const submitted = unread.filter((n) => n.type === "submitted").length;
        const feedback = unread.filter((n) => n.type === "feedback").length;
        const approved = unread.filter((n) => n.type === "approved").length;

        document.querySelector('[data-type="all"]').innerText =
          `All (${allCount})`;
        document.querySelector('[data-type="submitted"]').innerText =
          `File Submitted (${submitted})`;
        document.querySelector('[data-type="feedback"]').innerText =
          `Feedback Added (${feedback})`;

        const approvedBtn = document.querySelector('[data-type="approved"]');
        if (approvedBtn) {
          approvedBtn.innerText = `File Approved (${approved})`;
        }

        const newBadge = document.getElementById("newCount");
        if (newBadge) {
          newBadge.innerText = `${allCount} new`;
        }
      }
      const btn = document.getElementById("markAll");

      btn.addEventListener("click", () => {
        let data = JSON.parse(localStorage.getItem("notifications")) || [];

        data = data.map((n) => ({
          ...n,
          read: true,
        }));

        localStorage.setItem("notifications", JSON.stringify(data));

        showNotifications("all");

        btn.classList.add("clicked");

        setTimeout(() => {
          btn.classList.remove("clicked");
        }, 800);
      });
      function getData() {
        return JSON.parse(localStorage.getItem("files")) || [];
      }

      function renderReviews(filter = "all") {
        const container = document.getElementById("reviews-container");
        const data = getData();

        container.innerHTML = "";

        let filtered = data;

        if (filter !== "all") {
          filtered = data.filter((f) => f.status === filter);
        }

        if (filtered.length === 0) {
          container.innerHTML = "<p>No files</p>";
          return;
        }

        filtered.forEach((file) => {
          const title = file.title || "No title";
          const student = file.student || "Unknown";
          const date = file.date || "No date";
          const comment = file.comment || "No comment";
          const status = file.status || "pending";

          container.innerHTML += `
      <div class="card">
        <div class="top">
          <div>
            <strong>${title}</strong><br>
            <small>${student} • ${date}</small>
          </div>

          <span class="status ${status}">${status}</span>
        </div>

        <div class="comment">${comment}</div>

        <div class="actions">
          <button onclick="setStatus(${file.id}, 'reviewed')">Review</button>
          <button onclick="setStatus(${file.id}, 'approved')">Approve</button>
        </div>
      </div>
    `;
        });
      }

      function setStatus(id, newStatus) {
        let data = getData();

        data = data.map((f) => {
          if (f.id === id) {
            return { ...f, status: newStatus };
          }
          return f;
        });

        localStorage.setItem("files", JSON.stringify(data));

        renderReviews();
      }
      function filterReviews(type, event) {
        renderReviews(type);

        document.querySelectorAll(".filters button").forEach((btn) => {
          btn.classList.remove("active");
        });

        event.target.classList.add("active");
      }
      document.addEventListener("DOMContentLoaded", () => {
        renderReviews();
      });
    });
  }
});
