<?php
$conn = new mysqli("localhost", "root", "");
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Create database if not exists
$conn->query("CREATE DATABASE IF NOT EXISTS thesis CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
$conn->select_db("thesis");

$queries = [
    "CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('student', 'supervisor') NOT NULL,
        field VARCHAR(255) DEFAULT NULL,
        phone VARCHAR(50) DEFAULT NULL,
        available BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )",
    
    "CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        status ENUM('in-progress', 'reviewed', 'completed') DEFAULT 'in-progress',
        supervisor_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (supervisor_id) REFERENCES users(id) ON DELETE CASCADE
    )",
    
    "CREATE TABLE IF NOT EXISTS project_users (
        project_id INT NOT NULL,
        user_id INT NOT NULL,
        PRIMARY KEY (project_id, user_id),
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )",
    
    "CREATE TABLE IF NOT EXISTS files (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        size VARCHAR(50) NOT NULL,
        status ENUM('draft', 'pending', 'reviewed', 'approved', 'rejected') DEFAULT 'draft',
        comment TEXT DEFAULT NULL,
        feedback TEXT DEFAULT NULL,
        user_id INT NOT NULL,
        project_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )",
    
    "CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        desc_text TEXT DEFAULT NULL,
        status ENUM('pending', 'progress', 'done') DEFAULT 'pending',
        deadline DATE DEFAULT NULL,
        project_id INT NOT NULL,
        created_by INT NOT NULL,
        type ENUM('student', 'supervisor') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    )",
    
    "CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        content TEXT NOT NULL,
        from_user INT NOT NULL,
        project_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (from_user) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )",
    
    "CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        project_id INT DEFAULT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )"
];

foreach ($queries as $query) {
    if (!$conn->query($query)) {
        echo "Error creating table: " . $conn->error . "<br>";
    }
}

echo "Database and tables initialized successfully.";
$conn->close();
?>
