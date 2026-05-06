# 🌐 Deployment Guide - ThesisTrack

This guide will walk you through the process of hosting your ThesisTrack platform on a live server.

## 1. Choose a Hosting Provider
Since this is a PHP/MySQL project, you need a host that supports **PHP 7.4+** and **MySQL**.

### Recommended Options:
- **InfinityFree / 000WebHost**: Free options for testing (not recommended for actual thesis work due to limits).
- **Bluehost / HostGator / Namecheap**: Affordable shared hosting with cPanel (Highly Recommended for beginners).
- **DigitalOcean / Vultr**: VPS hosting (For advanced users).

---

## 2. Steps to Deploy (cPanel/Shared Hosting)

### Step A: Prepare the Files
1. Compress your project folder into a `.zip` file (exclude `.git` folders).
2. Ensure `api/Connect.php` is ready to be updated with server credentials.

### Step B: Upload Files
1. Log into your **cPanel**.
2. Open **File Manager**.
3. Go to `public_html`.
4. Upload your `.zip` file and **Extract** it there.

### Step C: Setup Database
1. In cPanel, open **MySQL Database Wizard**.
2. Create a database (e.g., `yourname_thesis`).
3. Create a database user and a strong password.
4. **Grant all privileges** to the user for that database.
5. Go to **PHPMyAdmin** in cPanel, select your new database, and import the database structure (use the code from `api/setup_db.php`).

### Step D: Update Connection String
1. Edit `api/Connect.php` on the server:
   ```php
   $conn = mysqli_connect("localhost", "yourname_user", "your_password", "yourname_thesis");
   ```

### Step E: Permissions
1. Ensure the `uploads/` folder has **Write Permissions** (usually `755` or `777`).

---

## 3. GitHub Management (Best Practices)

To keep your GitHub clean and up to date:

1. **Delete old code**:
   - Go to your repository settings on GitHub.
   - You can either delete the whole repository and create a new one, or delete files manually.
2. **Push the new code**:
   - Open terminal in your project folder.
   - `git init`
   - `git add .`
   - `git commit -m "Initial professional release"`
   - `git remote add origin https://github.com/yourusername/your-repo.git`
   - `git push -u origin main --force`

---

## 4. Final Checklist
- [ ] SSL Certificate enabled (HTTPS).
- [ ] `uploads/` folder is accessible and writable.
- [ ] Database credentials are correct.
- [ ] Test the Login and Registration flow on the live URL.

---
Need help? Contact the developer.
