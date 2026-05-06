# 🎓 ThesisTrack - Management & Collaboration Platform

ThesisTrack is a comprehensive web-based platform designed to streamline the thesis supervision process. It facilitates seamless collaboration between students and supervisors, providing tools for project management, file sharing, task tracking, and real-time communication.

[![Project Status](https://img.shields.io/badge/status-ready--to--deploy-success.svg)](https://your-deployment-link.com)
[![PHP Version](https://img.shields.io/badge/php-%5E7.4%20%7C%208.x-blue.svg)](https://www.php.net/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## ✨ Features

### 👨‍🎓 For Students
- **Profile Management**: Complete academic profile with Student ID, Department, and Enrollment data.
- **Supervisor Search**: Find available supervisors by research field and send supervision requests.
- **Project Dashboard**: Track the overall progress and status of your thesis.
- **Task Tracking**: Manage your personal tasks and view tasks assigned by your supervisor.
- **Secure File Sharing**: Upload thesis drafts (PDF, DOCX, ZIP) with unique naming and version control.
- **Interactive Chat**: Direct messaging within the project group.

### 👨‍🏫 For Supervisors
- **Centralized Dashboard**: Overview of all active projects, pending reviews, and recent notifications.
- **Project Oversight**: Create and manage multiple student projects.
- **File Review System**: Review student submissions, provide feedback, and approve/reject drafts.
- **Task Delegation**: Assign specific tasks to students with deadlines.
- **Availability Toggle**: Control your availability for new supervision requests.

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, Vanilla CSS3 (Custom Design), JavaScript (ES6+).
- **Backend**: PHP (Object-Oriented Logic).
- **Database**: MySQL with Prepared Statements for security.
- **Styling**: Google Fonts (Poppins), FontAwesome 6 Icons.
- **Security**: Password Hashing (Bcrypt), Unique File Naming, Role-based Access Control.

---

## 🚀 Installation & Deployment

### 💻 Local Setup (XAMPP/WAMP)
1. Clone the repository: `git clone https://github.com/yourusername/thesis_project.git`
2. Move the project to your `htdocs` folder.
3. Import the database:
   - Open PHPMyAdmin.
   - Create a database named `thesis`.
   - Import `api/setup_db.php` or the provided SQL dump.
4. Update `api/Connect.php` with your database credentials.
5. Open `http://localhost/thesis_project/views/login.html`.

### 🌐 Online Deployment
For full instructions on how to host this platform online, please refer to the [Deployment Guide](DEPLOYMENT.md).

---

## 📸 Screenshots

| Dashboard | Profile | Messages |
| :---: | :---: | :---: |
| ![Dashboard](https://via.placeholder.com/300x200?text=Dashboard) | ![Profile](https://via.placeholder.com/300x200?text=Profile) | ![Messages](https://via.placeholder.com/300x200?text=Messages) |

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
Created with ❤️ for Academic Excellence.
