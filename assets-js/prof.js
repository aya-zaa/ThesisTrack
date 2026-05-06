document.addEventListener("DOMContentLoaded", () => {
    // Session Check & UI Initialization
    fetch("../api/session.php")
        .then(res => res.json())
        .then(user => {
            console.log("User data loaded:", user);
            if (!user.logged_in || user.role !== 'supervisor') {
                window.location.href = "login.html";
                return;
            }
            initUI(user);
            routePage();
            
            // Auto-refresh notifications and projects every 60s
            setInterval(() => {
                if (document.body.classList.contains("dashboard-prof")) loadDashboard();
                else loadNotifications();
            }, 60000);
        });

    function initUI(user) {
        const userNameElem = document.getElementById("userName");
        if (userNameElem) userNameElem.innerText = user.name;
        
        const profNameElem = document.getElementById("profName");
        if (profNameElem) profNameElem.innerText = "Dr. " + user.name;
        
        const deptElem = document.getElementById("dept");
        if (deptElem) deptElem.innerText = user.field || "Computer Science";

        // Profile Page Data
        if (document.getElementById("displayName")) document.getElementById("displayName").innerText = user.name;
        if (document.getElementById("displayField")) document.getElementById("displayField").innerText = user.field || "--";
        if (document.getElementById("displayId")) document.getElementById("displayId").innerText = user.display_id;
        if (document.getElementById("displayDept")) document.getElementById("displayDept").innerText = user.field || "--";
        if (document.getElementById("displayStatus")) document.getElementById("displayStatus").innerText = user.available ? "Available" : "Not Available";
        if (document.getElementById("name")) document.getElementById("name").value = user.name;
        if (document.getElementById("email")) document.getElementById("email").value = user.email;
        if (document.getElementById("phone")) document.getElementById("phone").value = user.phone || "";
        if (document.getElementById("field")) document.getElementById("field").value = user.field || "";
        if (document.getElementById("department")) document.getElementById("department").value = user.department || "Computer Science";
        if (document.getElementById("supervisorId")) document.getElementById("supervisorId").value = user.display_id;
        if (document.getElementById("status")) document.getElementById("status").value = user.available ? "Available" : "Not Available";

        // Initial Avatar
        updateAvatar(user.name);
    }

    function updateAvatar(name) {
        const initials = name ? name.split(" ").map(n => n[0]).join("").toUpperCase() : "U";
        const colors = ["#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
        const color = colors[(name ? name.length : 0) % colors.length];
        
        const avatar = document.getElementById("avatar");
        if (avatar) {
            avatar.innerText = initials;
            avatar.style.backgroundColor = color;
            avatar.style.color = "#fff";
            avatar.style.display = "flex";
            avatar.style.alignItems = "center";
            avatar.style.justifyContent = "center";
            avatar.style.fontSize = "2rem";
            avatar.style.fontWeight = "bold";
        }
        
        const mini = document.getElementById("miniAvatar") || document.querySelector(".mini-avatar");
        if (mini) {
            mini.innerText = initials;
            mini.style.backgroundColor = color;
            mini.style.color = "#fff";
            mini.style.display = "flex";
            mini.style.alignItems = "center";
            mini.style.justifyContent = "center";
            mini.style.fontSize = "0.8rem";
            mini.style.fontWeight = "bold";
            mini.style.borderRadius = "50%";
        }
    }

    function routePage() {
        if (document.body.classList.contains("dashboard-prof")) {
            loadDashboard();
        } else if (document.body.classList.contains("projects-page") && !document.body.classList.contains("files-prof-page")) {
            loadProjects();
        } else if (document.body.classList.contains("files-prof-page")) {
            loadFiles();
        } else if (document.body.classList.contains("messages-page")) {
            loadMessages();
        } else if (document.body.classList.contains("reviews-page")) {
            loadFiles(); // Reviews share file loading
        }
    }

    function loadDashboard() {
        loadProjects();
        loadFiles();
        loadNotifications();
    }

    function loadNotifications() {
        fetch("../api/get_notifications.php")
            .then(res => res.json())
            .then(data => {
                const container = document.getElementById("notifList");
                if (!container) return;
                container.innerHTML = "";
                data.forEach(n => {
                    container.innerHTML += `
                        <div class="notification-item ${n.is_read ? "" : "unread"}">
                            <p>${n.message}</p>
                            <small>${formatRelativeTime(n.created_at)}</small>
                        </div>
                    `;
                });
            });
    }

    // Projects Management
    let globalProjects = [];

    function loadProjects() {
        fetch("../api/get_projects.php")
            .then(res => res.json())
            .then(projects => {
                globalProjects = projects;
                renderProjects();
            });
    }

    window.renderProjects = function() {
        const container = document.getElementById("projects-container") || document.getElementById("projectsList");
        const emptyState = document.getElementById("empty-state");
        if (!container) return;
        
        container.innerHTML = "";
        
        if (globalProjects.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding: 40px; color: #888; grid-column: 1/-1;">
                    <i class="fa fa-folder-open" style="font-size: 3rem; margin-bottom: 10px;"></i>
                    <p>No projects found. Create one to get started!</p>
                </div>
            `;
            if (emptyState) emptyState.style.display = "block";
            return;
        }
        if (emptyState) emptyState.style.display = "none";

        globalProjects.forEach((p, index) => {
            container.innerHTML += `
                <div class="project-card" onclick="openProject(${p.id})">
                    <div class="project-left">
                        <div class="avatars">
                            ${(p.students || []).map(s => `<div class="avatar">${s.name.charAt(0).toUpperCase()}</div>`).join("")}
                        </div>
                        <div>
                            <h4>${p.title}</h4>
                            <p>${(p.students || []).map(s => s.name).join(", ")}</p>
                        </div>
                    </div>
                    <div>
                        <select class="status ${p.status}" onclick="event.stopPropagation()" onchange="changeStatus(${p.id}, this.value)">
                            <option value="in-progress" ${p.status === "in-progress" ? "selected" : ""}>In Progress</option>
                            <option value="reviewed" ${p.status === "reviewed" ? "selected" : ""}>Reviewed</option>
                            <option value="completed" ${p.status === "completed" ? "selected" : ""}>Completed</option>
                        </select>
                    </div>
                </div>
            `;
        });
        
        updateStats();
    };

    function updateStats() {
        if(document.getElementById("total-count")) document.getElementById("total-count").textContent = globalProjects.length;
        if(document.getElementById("progress-count")) document.getElementById("progress-count").textContent = globalProjects.filter(p => p.status === "in-progress").length;
        if(document.getElementById("reviewed-count")) document.getElementById("reviewed-count").textContent = globalProjects.filter(p => p.status === "reviewed").length;
        if(document.getElementById("completed-count")) document.getElementById("completed-count").textContent = globalProjects.filter(p => p.status === "completed").length;
        
        // Dashboard stats
        if(document.getElementById("progressCount")) document.getElementById("progressCount").textContent = globalProjects.filter(p => p.status === "in-progress").length;
        if(document.getElementById("reviewedCount")) document.getElementById("reviewedCount").textContent = globalProjects.filter(p => p.status === "reviewed").length;
        if(document.getElementById("completedCount")) document.getElementById("completedCount").textContent = globalProjects.filter(p => p.status === "completed").length;
        if(document.getElementById("totalProjects")) document.getElementById("totalProjects").textContent = globalProjects.length;
    }

    // Add Project
    const projectForm = document.getElementById("project-form");
    if (projectForm) {
        projectForm.addEventListener("submit", function(e) {
            e.preventDefault();
            const title = document.getElementById("project-title").value.trim();
            const status = document.getElementById("project-status").value;
            const emailInputs = document.querySelectorAll(".student-email");
            let emails = [];
            emailInputs.forEach(input => {
                if(input.value.trim() !== "") emails.push(input.value.trim());
            });

            if (emails.length === 0) {
                alert("Add at least one student email");
                return;
            }

            fetch("../api/create_project.php", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `title=${encodeURIComponent(title)}&status=${encodeURIComponent(status)}&emails=${encodeURIComponent(emails.join(","))}`
            }).then(res => res.json()).then(data => {
                if (data.success) {
                    closeModal();
                    loadProjects();
                    showToast("Project created successfully!");
                } else {
                    showToast(data.message, "error");
                }
            });
        });
    }

    window.openAddModal = function() {
        document.getElementById("modal").classList.remove("hidden");
    };
    
    window.closeModal = function() {
        document.getElementById("modal").classList.add("hidden");
        if(document.getElementById("project-form")) document.getElementById("project-form").reset();
    };

    window.addStudent = function() {
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

    window.changeStatus = function(id, status) {
        fetch("../api/update_project.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `id=${id}&status=${status}`
        }).then(() => loadProjects());
    };

    window.openProject = function(id) {
        localStorage.setItem("selectedProjectId", id);
        window.location.href = "project-details.html";
    };

    // Project Details Page
    if (document.getElementById("tasks-container") && localStorage.getItem("selectedProjectId")) {
        loadTasks(localStorage.getItem("selectedProjectId"));
    }

    let globalTasks = [];
    function loadTasks(projectId) {
        fetch(`../api/get_tasks.php?project_id=${projectId}`)
            .then(res => res.json())
            .then(tasks => {
                globalTasks = tasks;
                renderTasks();
            });
    }

    function renderTasks() {
        const container = document.getElementById("tasks-container");
        if (!container) return;
        container.innerHTML = "";
        
        if (globalTasks.length === 0) {
            container.innerHTML = "<p>No tasks yet.</p>";
            return;
        }

        globalTasks.forEach(t => {
            container.innerHTML += `
                <div class="file-card">
                    <div class="file-info">
                        <span class="file-name">${t.title}</span>
                        <span class="file-meta">Deadline: ${t.deadline || 'No deadline'}</span>
                        ${t.desc ? `<span class="file-meta">${t.desc}</span>` : ""}
                    </div>
                    <div class="file-actions">
                        <span class="file-status">${t.status}</span>
                        <button onclick="editTask(${t.id}, '${t.title}', '${t.desc}', '${t.deadline}')" class="icon-btn"><i class="fa fa-pen"></i></button>
                        <button onclick="deleteTask(${t.id})" class="icon-btn danger"><i class="fa fa-trash"></i></button>
                    </div>
                </div>
            `;
        });
    }

    window.openTaskModal = function() { document.getElementById("task-modal").classList.remove("hidden"); };
    window.closeTaskModal = function() { 
        document.getElementById("task-modal").classList.add("hidden"); 
        editingTaskId = null;
        document.getElementById("task-title").value = "";
        document.getElementById("task-deadline").value = "";
        document.getElementById("task-notes").value = "";
    };

    let editingTaskId = null;
    window.addTask = function() {
        const title = document.getElementById("task-title").value.trim();
        const deadline = document.getElementById("task-deadline").value;
        const notes = document.getElementById("task-notes").value.trim();
        const projectId = localStorage.getItem("selectedProjectId");

        if (!title) return alert("Fill required fields");

        let url = editingTaskId ? "../api/update_task.php" : "../api/add_task.php";
        let body = editingTaskId ? 
            `id=${editingTaskId}&title=${encodeURIComponent(title)}&desc=${encodeURIComponent(notes)}&deadline=${deadline}` : 
            `project_id=${projectId}&title=${encodeURIComponent(title)}&note=${encodeURIComponent(notes)}&deadline=${deadline}`;

        fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: body
        }).then(() => {
            closeTaskModal();
            loadTasks(projectId);
        });
    };

    window.editTask = function(id, title, desc, deadline) {
        editingTaskId = id;
        document.getElementById("task-title").value = title;
        document.getElementById("task-notes").value = desc !== 'null' ? desc : '';
        document.getElementById("task-deadline").value = deadline !== 'null' ? deadline : '';
        openTaskModal();
    };

    window.deleteTask = function(id) {
        if(confirm("Delete this task?")) {
            fetch("../api/delete_task.php", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `id=${id}`
            }).then(() => loadTasks(localStorage.getItem("selectedProjectId")));
        }
    };

    // Files Management
    let globalFiles = [];
    let currentFilter = "all";

    function loadFiles() {
        fetch("../api/get_files.php")
            .then(res => res.json())
            .then(files => {
                globalFiles = files;
                renderFilesProf();
                if(document.body.classList.contains("reviews-page")) {
                    renderReviews();
                }
            });
    }

    function renderFilesProf() {
        const container = document.getElementById("files-container") || document.getElementById("filesList");
        const empty = document.getElementById("empty-state");
        if (!container) return;

        let filtered = globalFiles;
        if (currentFilter !== "all") {
            filtered = filtered.filter(f => f.status === currentFilter);
        }

        const searchInput = document.getElementById("search");
        if (searchInput && searchInput.value) {
            const query = searchInput.value.toLowerCase();
            filtered = filtered.filter(f => f.name.toLowerCase().includes(query) || f.project.toLowerCase().includes(query));
        }

        container.innerHTML = "";
        if (filtered.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding: 40px; color: #888; grid-column: 1/-1;">
                    <i class="fa fa-file-alt" style="font-size: 3rem; margin-bottom: 10px;"></i>
                    <p>No files matching your criteria.</p>
                </div>
            `;
            if (empty) empty.style.display = "block";
            return;
        }
        if (empty) empty.style.display = "none";

        filtered.forEach(f => {
            container.innerHTML += `
                <div class="file-card">
                    <div class="file-top" onclick="window.open('../uploads/${f.name}', '_blank')">
                        <div class="file-icon">📄</div>
                        <span class="file-type ${f.type.toLowerCase()}">${f.type}</span>
                    </div>
                    <div class="file-name">${f.name}</div>
                    <div class="file-info">
                        <span class="file-meta">${formatRelativeTime(f.date)}</span>
                        <span class="file-meta">📁 ${f.project}</span>
                    </div>
                    <span class="file-status ${f.status}">${f.status}</span>
                    ${f.feedback ? `<div class="file-feedback"><span>💬 ${f.feedback}</span></div>` : ""}
                    <div class="file-actions">
                        ${f.status === 'pending' || f.status === 'reviewed' ? `<button class="icon-btn" title="Review" onclick="event.stopPropagation(); reviewFile(${f.id}, '${f.feedback || ''}')"><i class="fa fa-comment"></i></button>
                        <button class="icon-btn" title="Approve" onclick="event.stopPropagation(); approveFile(${f.id})">✔</button>` : ''}
                        <button class="icon-btn" title="Download" onclick="event.stopPropagation(); window.open('../uploads/${f.name}', '_blank')"><i class="fa fa-download"></i></button>
                    </div>
                </div>
            `;
        });
    }

    window.filterFiles = function(status, event) {
        currentFilter = status;
        document.querySelectorAll(".filters button").forEach(btn => btn.classList.remove("active"));
        if(event) event.target.classList.add("active");
        renderFilesProf();
    };

    window.approveFile = function(id) {
        fetch("../api/review_file.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `id=${id}&status=approved`
        }).then(() => loadFiles());
    };

    let reviewingFileId = null;
    window.reviewFile = function(id, oldFeedback) {
        reviewingFileId = id;
        document.getElementById("feedback-input").value = oldFeedback;
        document.getElementById("feedback-modal").classList.remove("hidden");
    };

    window.closeFeedback = function() {
        document.getElementById("feedback-modal").classList.add("hidden");
    };

    window.submitFeedback = function() {
        const feedback = document.getElementById("feedback-input").value.trim();
        if (!feedback) return;
        fetch("../api/review_file.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `id=${reviewingFileId}&status=reviewed&feedback=${encodeURIComponent(feedback)}`
        }).then(() => {
            closeFeedback();
            loadFiles();
        });
    };

    document.getElementById("search")?.addEventListener("input", renderFilesProf);

    // Reviews Page specific
    function renderReviews() {
        const container = document.getElementById("reviews-container");
        if (!container) return;
        
        let reviewedFiles = globalFiles.filter(f => f.status === 'reviewed' || f.status === 'approved');
        container.innerHTML = "";
        
        reviewedFiles.forEach(f => {
            container.innerHTML += `
                <div class="file-card">
                    <h4>${f.name}</h4>
                    <p>Status: ${f.status}</p>
                    <p>Feedback: ${f.feedback || 'None'}</p>
                </div>
            `;
        });
    }

    window.filterReviews = function(status) {
        // Simple filter for reviews page
        const container = document.getElementById("reviews-container");
        if (!container) return;
        let reviewedFiles = globalFiles.filter(f => f.status === 'reviewed' || f.status === 'approved');
        if (status !== 'all') reviewedFiles = reviewedFiles.filter(f => f.status === status);
        
        container.innerHTML = "";
        reviewedFiles.forEach(f => {
            container.innerHTML += `<div class="file-card"><h4>${f.name}</h4><p>Status: ${f.status}</p><p>Feedback: ${f.feedback || 'None'}</p></div>`;
        });
    };

    // Profile Settings
    const editBtn = document.getElementById("editBtn");
    const saveBtn = document.getElementById("saveBtn");
    const profileInputs = document.querySelectorAll(".profile-page input, .profile-page select");

    if (editBtn && saveBtn) {
        editBtn.onclick = () => {
            profileInputs.forEach(i => i.disabled = false);
            saveBtn.classList.remove("hidden");
        };

        saveBtn.onclick = () => {
            const name = document.getElementById("name").value;
            const phone = document.getElementById("phone").value;
            const field = document.getElementById("field").value;
            const department = document.getElementById("department").value;
            const available = document.getElementById("status").value === "Available";

            fetch("../api/update_profile.php", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}&field=${encodeURIComponent(field)}&department=${encodeURIComponent(department)}&available=${available}`
            }).then(res => res.json()).then(data => {
                if (data.success) {
                    profileInputs.forEach(i => i.disabled = true);
                    saveBtn.classList.add("hidden");
                    if (document.getElementById("displayName")) document.getElementById("displayName").innerText = name;
                    if (document.getElementById("displayField")) document.getElementById("displayField").innerText = field || "--";
                    if (document.getElementById("displayDept")) document.getElementById("displayDept").innerText = department || "Computer Science";
                    if (document.getElementById("displayStatus")) document.getElementById("displayStatus").innerText = available ? "Available" : "Not Available";
                    updateAvatar(name);
                    showToast("Profile updated successfully!");
                } else {
                    showToast(data.message, "error");
                }
            });
        };
    }

    // User Dropdown & Modals
    const userToggle = document.getElementById("userToggle");
    const userDropdown = document.getElementById("userDropdown");
    const confirmModal = document.getElementById("confirmModal");
    const deleteBtn = document.getElementById("deleteBtn");
    
    if (userToggle && userDropdown) {
        userToggle.onclick = () => userDropdown.classList.toggle("hidden");
        document.addEventListener("click", e => {
            if (!userToggle.contains(e.target) && !userDropdown.contains(e.target)) userDropdown.classList.add("hidden");
        });
    }

    if (deleteBtn && confirmModal) {
        deleteBtn.onclick = () => {
            confirmModal.classList.remove("hidden");
            // Professor modal elements might have slightly different names/IDs
            if (document.getElementById("modalTitle")) document.getElementById("modalTitle").innerText = "Delete Account";
            if (document.getElementById("modalText")) document.getElementById("modalText").innerText = "Are you sure you want to delete your account? This action cannot be undone.";
        };
        
        const cancelBtn = document.getElementById("cancelBtn");
        if (cancelBtn) cancelBtn.onclick = () => confirmModal.classList.add("hidden");
        
        const confirmBtn = document.getElementById("confirmBtn");
        if (confirmBtn) {
            confirmBtn.onclick = () => {
                fetch("../api/delete_account.php", { method: "POST" })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) window.location.href = "login.html";
                        else alert(data.message);
                    });
            };
        }
    }

    const logoutBtn = document.getElementById("logoutBtn");
    if(logoutBtn) {
        logoutBtn.onclick = () => {
            window.location.href = "../api/logout.php";
        };
    }

    // Messages Page
    let messages = [];
    function loadMessages() {
        fetch("../api/get_messages.php")
            .then(res => res.json())
            .then(data => {
                messages = data;
                renderProfInbox();
            });
    }

    window.renderProfInbox = function() {
        const container = document.getElementById("profMessagesList");
        if(!container) return;
        container.innerHTML = "";
        
        messages.forEach(m => {
            container.innerHTML += `
                <div class="message-row">
                    <div class="avatar">${m.from.charAt(0)}</div>
                    <div class="msg-content">
                        <div class="msg-title"><strong>${m.from}</strong> <span class="msg-date">${m.date}</span></div>
                        <div class="msg-subject">${m.to}</div>
                        <div class="msg-text">${m.content}</div>
                    </div>
                </div>
            `;
        });
    };
    
    window.renderProfSent = function() {
        // To be implemented: filter messages sent by supervisor. 
        // For project chat, it's a unified stream. 
        renderProfInbox(); 
    };

    window.setActive = function(e) {
        document.querySelectorAll(".tabs button").forEach(b => b.classList.remove("active"));
        e.target.classList.add("active");
    };

    window.openMsgForm = function() {
        const form = document.getElementById("new-message-form");
        if(form) form.classList.remove("hidden");
    };
    window.closeMsgForm = function() {
        const form = document.getElementById("new-message-form");
        if(form) form.classList.add("hidden");
    };

    window.sendNewMessage = function() {
        const content = document.getElementById("msg-content").value;
        const to = document.getElementById("msg-to").value; // Could be used to select project
        // Simplification for group chat: send to first project
        if(!content.trim()) return;
        
        // Fetch projects to get first project ID
        fetch("../api/get_projects.php").then(res => res.json()).then(projs => {
            if(projs.length > 0) {
                fetch("../api/send_message.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: `content=${encodeURIComponent(content)}&project_id=${projs[0].id}`
                }).then(() => {
                    closeMsgForm();
                    loadMessages();
                });
            }
        });
    };
});
