# ThesisTrack 🎓
> Smart academic workspace for thesis supervision, project collaboration, file management, and progress tracking.

---

## 🌐 Live Demo
🔗 **Website:** `PASTE-YOUR-LIVE-LINK-HERE`

---

## 📖 Overview

**ThesisTrack** is a modern web application designed to streamline the thesis workflow between students and supervisors through a centralized and intuitive platform.

The system combines project management, communication, task organization, and document review into a single academic workspace built to improve productivity and collaboration.

---

## ✨ Core Features

### 📂 Project Management
- Create and organize academic projects
- Track project status and progress
- Manage multiple student groups

### ✅ Task Tracking
- Assign and manage tasks
- Deadline management
- Progress monitoring system

### 📄 File Management
- Upload and organize project files (PDF / DOCX / ZIP)
- File review workflow
- Feedback and approval system

### 💬 Communication System
- Direct messaging between students and supervisors
- Inbox and sent management
- Structured academic communication

### 👤 User Profiles
- Personalized dashboards per role
- Supervisor and student profiles
- Account management system

### 📊 Dashboard & Analytics
- Project statistics overview
- Activity tracking
- Organized workspace experience

---

## 🛠️ Technologies Used

### Front-End
- HTML5
- CSS3 (Vanilla — Custom Design)
- JavaScript (ES6+ Modules)

### Back-End
- PHP 7.4+

### Database
- MySQL

### Libraries & Tools
- Font Awesome 6
- Google Fonts (Poppins)

---

## 🧩 Project Structure

```bash
thesis_project/
│
├── api/                    # Backend API Endpoints (PHP)
│   ├── Connect.php         # Database connection
│   ├── setup_db.php        # Database schema & initialization
│   ├── session.php         # Auth & role-based access
│   ├── login.php / register.php / logout.php
│   ├── update_profile.php
│   ├── get_projects.php / get_tasks.php / get_files.php
│   └── delete_account.php
│
├── assets-css/             # Stylesheets (Student, Supervisor, Login)
├── assets-js/              # JavaScript Modules
│   ├── student.js          # Student dashboard logic
│   ├── prof.js             # Supervisor dashboard logic
│   └── utils.js            # Global helpers (toasts, date formatting)
│
├── views/                  # Frontend HTML Pages
│   ├── login.html
│   ├── dashboard-student.html
│   ├── dashboard-prof.html
│   ├── profile-student.html
│   ├── profile-prof.html
│   └── ... (files, tasks, messages pages)
│
├── uploads/                # Storage for uploaded thesis files
├── README.md
└── DEPLOYMENT.md
```

---


## 🔮 Future Vision

ThesisTrack is designed with scalability in mind and can evolve into a complete academic collaboration platform with features such as:

- Real-time communication (WebSockets)
- Cloud storage integration
- AI-assisted supervision feedback
- Advanced analytics and reporting
- Multi-role administration panel
- Full mobile responsiveness

---


## 📜 License

This project is intended for educational and demonstration purposes.

---

## ❤️ About ThesisTrack

ThesisTrack reflects the idea of transforming traditional academic supervision into a more organized, interactive, and modern digital experience — bridging the gap between students and their supervisors through technology.
