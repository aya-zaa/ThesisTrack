document.addEventListener("DOMContentLoaded", () => {
    // Session Check & UI Initialization
    fetch("../api/session.php")
        .then(res => res.json())
        .then(user => {
            console.log("User data loaded:", user);
            if (!user.logged_in || user.role !== 'student') {
                window.location.href = "login.html";
                return;
            }
            initUI(user);
            routePage();
            
            // Auto-refresh notifications and dashboard data every 60s
            setInterval(() => {
                if (document.body.classList.contains("dashboard-page")) loadDashboard();
                else loadNotifications();
            }, 60000);
        });

    function initUI(user) {
        const userNameElem = document.getElementById("userName");
        if (userNameElem) userNameElem.innerText = user.name;
        
        if (document.getElementById("displayName")) document.getElementById("displayName").innerText = user.name;
        if (document.getElementById("displayField")) document.getElementById("displayField").innerText = user.field || "--";
        if (document.getElementById("displayId")) document.getElementById("displayId").innerText = user.display_id;
        if (document.getElementById("studentId")) document.getElementById("studentId").value = user.display_id;
        if (document.getElementById("name")) document.getElementById("name").value = user.name;
        if (document.getElementById("email")) document.getElementById("email").value = user.email;
        if (document.getElementById("phone")) document.getElementById("phone").value = user.phone || "";
        if (document.getElementById("field")) document.getElementById("field").value = user.field || "";
        if (document.getElementById("department")) document.getElementById("department").value = user.department || "Computer Science";
        if (document.getElementById("date")) document.getElementById("date").value = user.enrollment_date || "";
        
        // Fill top info boxes
        if (document.getElementById("displayProgram")) document.getElementById("displayProgram").innerText = user.field || "--";
        if (document.getElementById("displayDate")) document.getElementById("displayDate").innerText = user.enrollment_date || "Not set";
        
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
        if (document.body.classList.contains("dashboard-page")) {
            loadDashboard();
        } else if (document.body.classList.contains("files-page") || document.getElementById("files-container")) {
            loadFiles();
        } else if (document.body.classList.contains("tasks-page") || document.getElementById("tasks-container")) {
            loadTasks();
        } else if (document.body.classList.contains("messages-page") || document.getElementById("messages-list")) {
            loadMessages();
        } else if (document.body.classList.contains("search-page") || document.getElementById("supervisors-container")) {
            loadSupervisors();
        } else if (document.body.classList.contains("profile-page")) {
            loadProfileAcademic();
        }
    }

    function loadSupervisors() {
        fetch("../api/get_supervisors.php")
            .then(res => res.json())
            .then(data => {
                const container = document.getElementById("supervisors-container");
                if (!container) return;
                container.innerHTML = "";
                
                if (data.length === 0) {
                    container.innerHTML = `<p style="text-align:center; padding: 20px; color: #888;">No supervisors found.</p>`;
                    return;
                }

                data.forEach(s => {
                    container.innerHTML += `
                        <div class="supervisor-card">
                            <div class="sup-avatar">${s.name.charAt(0).toUpperCase()}</div>
                            <div class="sup-info">
                                <h4>Dr. ${s.name}</h4>
                                <p>${s.field || 'General Research'}</p>
                                <span class="badge ${s.available ? 'available' : 'busy'}">${s.available ? 'Available' : 'Not Available'}</span>
                            </div>
                            <button onclick="contactSupervisor(${s.id})" class="contact-btn">Contact</button>
                        </div>
                    `;
                });
            });
    }

    window.contactSupervisor = function(id) {
        const s = lastLoadedSupervisors.find(x => x.id == id);
        if(!s) return;
        
        document.getElementById("selectedSupervisor").innerText = "Dr. " + s.name;
        document.getElementById("modalField").innerText = s.field || 'General Research';
        document.getElementById("modalAvatar").innerText = s.name.charAt(0).toUpperCase();
        document.getElementById("requestModal").classList.remove("hidden");
        
        window.currentRequestSupId = id;
    };

    window.closeRequestModal = function() {
        document.getElementById("requestModal").classList.add("hidden");
    };

    window.sendRequest = function() {
        const msg = document.getElementById("requestMessage").value;
        if(!msg.trim()) return showToast("Please write a message", "error");
        
        fetch("../api/send_message.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `content=${encodeURIComponent(msg)}&receiver_id=${window.currentRequestSupId}`
        }).then(() => {
            closeRequestModal();
            showToast("Request sent successfully!");
        });
    };

    let lastLoadedSupervisors = [];
    function loadSupervisors() {
        fetch("../api/get_supervisors.php")
            .then(res => res.json())
            .then(data => {
                lastLoadedSupervisors = data;
                renderSupervisors();
            });
    }

    function renderSupervisors() {
        const container = document.getElementById("supervisors-container");
        if (!container) return;
        container.innerHTML = "";
        
        let filtered = lastLoadedSupervisors;
        const searchInput = document.getElementById("searchInput");
        if (searchInput && searchInput.value) {
            filtered = filtered.filter(s => s.name.toLowerCase().includes(searchInput.value.toLowerCase()));
        }

        if (filtered.length === 0) {
            container.innerHTML = `<p style="text-align:center; padding: 20px; color: #888; grid-column: 1/-1;">No supervisors found matching your search.</p>`;
            return;
        }

        filtered.forEach(s => {
            container.innerHTML += `
                <div class="supervisor-card">
                    <div class="sup-avatar" style="background:${["#0ea5e9", "#10b981", "#f59e0b", "#ef4444"][s.id % 4]}">${s.name.charAt(0).toUpperCase()}</div>
                    <div class="sup-info">
                        <h4>Dr. ${s.name}</h4>
                        <p>${s.field || 'General Research'}</p>
                        <span class="badge ${s.available ? 'available' : 'busy'}">${s.available ? 'Available' : 'Not Available'}</span>
                    </div>
                    <button onclick="contactSupervisor(${s.id})" class="contact-btn">Request Supervision</button>
                </div>
            `;
        });
    }

    document.getElementById("searchInput")?.addEventListener("input", renderSupervisors);

    function loadProfileAcademic() {
        fetch("../api/get_projects.php")
            .then(res => res.json())
            .then(projects => {
                if (projects.length > 0) {
                    const p = projects[0];
                    if (document.getElementById("supervisor")) document.getElementById("supervisor").value = p.supervisor_name || "--";
                    if (document.getElementById("displayProject")) {
                        // If student profile has a displayProject box (it had in my previous thought, let's re-check)
                        // Actually in student-profile.html it's displayProgram and displayDate.
                        // I'll add displaySupervisor if it exists.
                    }
                }
            });
    }

    function loadDashboard() {
        // Load everything for the dashboard
        loadFiles();
        loadTasks();
        loadNotifications();
        
        // Load current project info
        fetch("../api/get_projects.php")
            .then(res => res.json())
            .then(projects => {
                if (projects.length > 0) {
                    const p = projects[0];
                    if (document.getElementById("projectTitle")) document.getElementById("projectTitle").innerText = p.title;
                    if (document.getElementById("supervisor")) document.getElementById("supervisor").innerText = p.supervisor_name || "Assigned Supervisor";
                    if (document.getElementById("projectStatus")) {
                        document.getElementById("projectStatus").innerText = p.status;
                        document.getElementById("projectStatus").className = "status-badge " + p.status;
                    }
                }
            });
    }

    function loadNotifications() {
        fetch("../api/get_notifications.php")
            .then(res => res.json())
            .then(data => {
                const container = document.getElementById("notifications");
                if (!container) return;
                container.innerHTML = "";
                if (document.getElementById("notifCount")) document.getElementById("notifCount").innerText = data.filter(n => !n.is_read).length;

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

    // Files Management
    let files = [];
    let currentFilter = "all";

    function loadFiles() {
        fetch("../api/get_files.php")
            .then(res => res.json())
            .then(data => {
                files = data;
                renderFiles();
            });
    }

    function renderFiles() {
        const container = document.getElementById("files-container") || document.getElementById("files");
        if (!container) return;
        container.innerHTML = "";

        let filtered = files;
        if (currentFilter !== "all") {
            filtered = files.filter(f => f.status === currentFilter);
        }

        const searchInput = document.getElementById("search");
        if (searchInput && searchInput.value) {
            filtered = filtered.filter(f => f.name.toLowerCase().includes(searchInput.value.toLowerCase()));
        }

        if (filtered.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding: 40px; color: #888; grid-column: 1/-1;">
                    <i class="fa fa-folder-open" style="font-size: 3rem; margin-bottom: 10px;"></i>
                    <p>No files found in this category.</p>
                </div>
            `;
            return;
        }

        filtered.forEach(f => {
            container.innerHTML += `
            <div class="file-card">
                <div class="file-top">
                    <a href="../uploads/${f.name}" target="_blank" class="file-link">
                        <div class="file-icon">📄</div>
                    </a>
                    <span class="file-type">${f.type}</span>
                </div>
                <a href="../uploads/${f.name}" target="_blank" class="file-link">
                    <div class="file-name">${f.name}</div>
                </a>
                <div class="file-info">${formatRelativeTime(f.date)}</div>
                ${f.notes ? `<div class="file-notes">${f.notes}</div>` : ""}
                <span class="file-status ${f.status}">${f.status}</span>
                <div class="file-actions">
                    ${f.status === "draft" ? `<button class="send-btn" onclick="sendFile(${f.id})">Submit</button>` : ``}
                    <button class="delete-btn" onclick="deleteFile(${f.id})">Delete</button>
                </div>
            </div>`;
        });
    }

    window.filterFiles = function(type) {
        currentFilter = type;
        renderFiles();
    };

    const fileForm = document.getElementById("file-form");
    if (fileForm) {
        fileForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const fileInput = document.getElementById("file-upload");
            if (!fileInput.files.length) return;

            const formData = new FormData();
            formData.append("file", fileInput.files[0]);
            formData.append("notes", document.getElementById("file-notes")?.value || "");
            formData.append("type", document.getElementById("file-type")?.value || "DOCX");

            fetch("../api/upload_file.php", {
                method: "POST",
                body: formData,
            }).then(res => res.json()).then(data => {
                if(data.success) {
                    loadFiles();
                    closeModal();
                    fileForm.reset();
                    showToast("File uploaded successfully!");
                } else {
                    showToast(data.message, "error");
                }
            });
        });
    }

    window.sendFile = function(id) {
        fetch("../api/send_file.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `id=${id}`
        }).then(() => loadFiles());
    };

    window.deleteFile = function(id) {
        if (confirm("Are you sure you want to delete this file?")) {
            fetch("../api/delete_file.php", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `id=${id}`
            }).then(res => res.json()).then(data => {
                if (data.success) {
                    loadFiles();
                    showToast("File deleted.");
                } else {
                    showToast(data.message, "error");
                }
            });
        }
    };

    window.openAddModal = function() {
        const modal = document.getElementById("modal");
        if (modal) modal.classList.remove("hidden");
    };

    window.closeModal = function() {
        const modal = document.getElementById("modal");
        if (modal) modal.classList.add("hidden");
    };
    
    document.getElementById("open-modal-btn")?.addEventListener("click", openAddModal);

    // Tasks Management
    let tasks = [];
    let taskFilter = "all";
    let currentView = "my";
    let editTaskIndex = null;

    function loadTasks() {
        fetch("../api/get_tasks.php")
            .then(res => res.json())
            .then(data => {
                if(Array.isArray(data)) {
                    tasks = data;
                    renderTasks();
                }
            });
    }

    function renderTasks() {
        const container = document.getElementById("tasks-container") || document.getElementById("tasks");
        const supContainer = document.getElementById("supTasks");
        if (!container && !supContainer) return;
        
        if (container) container.innerHTML = "";
        if (supContainer) supContainer.innerHTML = "";

        let filtered = tasks;
        if (taskFilter !== "all") filtered = tasks.filter(t => t.status === taskFilter);
        
        if (filtered.length === 0) {
            const emptyMsg = `
                <div style="text-align:center; padding: 20px; color: #888;">
                    <p>No tasks to display.</p>
                </div>
            `;
            if (container) container.innerHTML = emptyMsg;
            if (supContainer && document.body.classList.contains("dashboard-page")) supContainer.innerHTML = emptyMsg;
            return;
        }

        // If on dashboard, we might want to split them
        if (document.body.classList.contains("dashboard-page")) {
            const myTasks = filtered.filter(t => !t.supervisor);
            const sTasks = filtered.filter(t => t.supervisor);
            
            if (myTasks.length === 0 && container) container.innerHTML = `<p style="text-align:center;color:#888;padding:10px;">No personal tasks</p>`;
            else myTasks.forEach(t => renderTaskItem(container, t));

            if (sTasks.length === 0 && supContainer) supContainer.innerHTML = `<p style="text-align:center;color:#888;padding:10px;">No supervisor tasks</p>`;
            else sTasks.forEach(t => renderTaskItem(supContainer, t));
        } else {
            if (currentView === "my") {
                filtered = filtered.filter(t => !t.supervisor);
            } else {
                filtered = filtered.filter(t => t.supervisor);
            }
            if (filtered.length === 0 && container) container.innerHTML = `<p style="text-align:center;color:#888;padding:20px;">No tasks found here.</p>`;
            else filtered.forEach(t => renderTaskItem(container, t));
        }

        let pending = tasks.filter(t => t.status === "pending").length;
        let progress = tasks.filter(t => t.status === "progress").length;
        let done = tasks.filter(t => t.status === "done").length;

        if(document.getElementById("pending-count")) document.getElementById("pending-count").textContent = pending;
        if(document.getElementById("progress-count")) document.getElementById("progress-count").textContent = progress;
        if(document.getElementById("done-count")) document.getElementById("done-count").textContent = done;
        if(document.getElementById("taskCount")) document.getElementById("taskCount").textContent = pending + progress;
    }

    function renderTaskItem(container, t) {
        if (!container) return;
        const isLate = t.deadline && new Date(t.deadline) < new Date() && t.status !== "done";
        container.innerHTML += `
            <div class="task-item">
                <div class="task-dot ${t.status}"></div>
                <div class="task-content">
                    <h4 class="${t.status === "done" ? "done-text" : ""}">${t.title}</h4>
                    <p>${t.desc || ""}</p>
                    <div class="task-meta ${isLate ? "late" : ""}">📅 ${t.deadline || "No deadline"}</div>
                </div>
                <div class="task-actions">
                    <select onchange="changeStatus(${t.id}, this.value)">
                        <option value="pending" ${t.status === "pending" ? "selected" : ""}>Pending</option>
                        <option value="progress" ${t.status === "progress" ? "selected" : ""}>In Progress</option>
                        <option value="done" ${t.status === "done" ? "selected" : ""}>Done</option>
                    </select>
                    ${!t.supervisor ? `<button onclick="editTask(${t.id}, '${t.title}', '${t.desc}', '${t.deadline}', '${t.status}')">✏️</button>` : ''}
                    <button class="check-btn" onclick="markDone(${t.id})">✓</button>
                    ${!t.supervisor ? `<button class="delete-btn small" onclick="deleteTask(${t.id})">✕</button>` : ''}
                </div>
            </div>
        `;
    }

    window.filterTasks = function(type) {
        taskFilter = type;
        renderTasks();
    };

    document.getElementById("my-tab")?.addEventListener("click", function() {
        currentView = "my";
        this.classList.add("active");
        document.getElementById("sup-tab")?.classList.remove("active");
        renderTasks();
    });

    document.getElementById("sup-tab")?.addEventListener("click", function() {
        currentView = "supervisor";
        this.classList.add("active");
        document.getElementById("my-tab")?.classList.remove("active");
        renderTasks();
    });

    const taskForm = document.getElementById("task-form");
    if (taskForm) {
        taskForm.addEventListener("submit", function(e) {
            e.preventDefault();
            const title = document.getElementById("task-title").value;
            const desc = document.getElementById("task-desc").value;
            const deadline = document.getElementById("task-deadline").value;
            const status = document.getElementById("task-status").value;

            if (!title.trim()) return;

            const url = editTaskIndex !== null ? "../api/update_task.php" : "../api/add_task.php";
            const body = editTaskIndex !== null ?
                `id=${editTaskIndex}&title=${encodeURIComponent(title)}&desc=${encodeURIComponent(desc)}&deadline=${deadline}&status=${status}` :
                `title=${encodeURIComponent(title)}&note=${encodeURIComponent(desc)}&deadline=${deadline}&status=${status}`;

            fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: body
            }).then(() => {
                closeTaskModal();
                loadTasks();
            });
        });
    }

    window.openTaskModal = function() {
        document.getElementById("task-modal")?.classList.remove("hidden");
    };
    
    window.closeTaskModal = function() {
        document.getElementById("task-modal")?.classList.add("hidden");
        editTaskIndex = null;
        if(taskForm) taskForm.reset();
    };

    window.changeStatus = function(id, status) {
        fetch("../api/update_task.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `id=${id}&status=${status}`
        }).then(() => loadTasks());
    };

    window.markDone = function(id) {
        changeStatus(id, 'done');
    };

    window.editTask = function(id, title, desc, deadline, status) {
        editTaskIndex = id;
        document.getElementById("task-title").value = title;
        document.getElementById("task-desc").value = desc !== 'null' ? desc : '';
        document.getElementById("task-deadline").value = deadline !== 'null' ? deadline : '';
        document.getElementById("task-status").value = status;
        openTaskModal();
    };

    window.deleteTask = function(id) {
        if(confirm("Delete this task?")) {
            fetch("../api/delete_task.php", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `id=${id}`
            }).then(() => loadTasks());
        }
    };

    document.getElementById("open-task-modal")?.addEventListener("click", openTaskModal);

    // Messages Management
    let messages = [];
    function loadMessages() {
        fetch("../api/get_messages.php")
            .then(res => res.json())
            .then(data => {
                messages = data;
                renderInbox();
            });
    }

    function renderInbox() {
        const container = document.getElementById("messages-list");
        if (!container) return;
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
    }

    window.openMsgForm = function() {
        const form = document.getElementById("new-message-form") || document.getElementById("message-view");
        if(form) form.innerHTML = `
            <div class="message-form">
                <h3>Send Message to Project Group</h3>
                <textarea id="replyText" placeholder="Write your message..."></textarea>
                <button onclick="sendReply()">Send</button>
            </div>
        `;
    };

    window.sendReply = function() {
        const text = document.getElementById("replyText").value;
        if (!text.trim()) return;
        
        fetch("../api/send_message.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `content=${encodeURIComponent(text)}`
        }).then(() => {
            const form = document.getElementById("message-view");
            if(form) form.innerHTML = "";
            loadMessages();
        });
    };

    // Logout
    const logoutBtn = document.getElementById("logoutBtn");
    if(logoutBtn) {
        logoutBtn.onclick = () => {
            window.location.href = "../api/logout.php";
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
            document.getElementById("modalTitle").innerText = "Delete Account";
            document.getElementById("modalText").innerText = "Are you sure you want to delete your account? This action cannot be undone.";
        };
        
        document.getElementById("cancelBtn").onclick = () => confirmModal.classList.add("hidden");
        
        document.getElementById("confirmBtn").onclick = () => {
            fetch("../api/delete_account.php", { method: "POST" })
                .then(res => res.json())
                .then(data => {
                    if (data.success) window.location.href = "login.html";
                    else alert(data.message);
                });
        };
    }

    // Profile Editing
    const editBtn = document.getElementById("editBtn");
    const saveBtn = document.getElementById("saveBtn");
    if (editBtn && saveBtn) {
        editBtn.onclick = () => {
            const inputs = document.querySelectorAll(".profile-page input:not(#studentId):not(#email)");
            inputs.forEach(i => i.disabled = false);
            saveBtn.classList.remove("hidden");
        };

        saveBtn.onclick = () => {
            const name = document.getElementById("name").value;
            const phone = document.getElementById("phone").value;
            const field = document.getElementById("field").value;
            const department = document.getElementById("department").value;
            const date = document.getElementById("date").value;

            fetch("../api/update_profile.php", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}&field=${encodeURIComponent(field)}&department=${encodeURIComponent(department)}&date=${date}`
            }).then(res => res.json()).then(data => {
                if (data.success) {
                    const inputs = document.querySelectorAll(".profile-page input");
                    inputs.forEach(i => i.disabled = true);
                    saveBtn.classList.add("hidden");
                    if (document.getElementById("displayName")) document.getElementById("displayName").innerText = name;
                    if (document.getElementById("displayField")) document.getElementById("displayField").innerText = field || "--";
                    if (document.getElementById("displayProgram")) document.getElementById("displayProgram").innerText = field || "--";
                    if (document.getElementById("displayDate")) document.getElementById("displayDate").innerText = date || "Not set";
                    updateAvatar(name);
                    showToast("Profile updated successfully!");
                } else {
                    showToast(data.message, "error");
                }
            });
        };
    }
});
