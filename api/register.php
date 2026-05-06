<?php
session_start();
require_once 'Connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = $_POST['name'] ?? '';
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    $role = $_POST['role'] ?? '';

    if (empty($name) || empty($email) || empty($password) || empty($role)) {
        echo json_encode(['status' => 'error', 'message' => 'All fields are required.']);
        exit;
    }

    if ($role === 'professor') {
        $role = 'supervisor'; // map professor to supervisor
    }

    // Check if email exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    if ($stmt->get_result()->num_rows > 0) {
        echo json_encode(['status' => 'error', 'message' => 'Email already registered.']);
        exit;
    }
    
    // Hash password
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    
    // Insert user
    $stmt = $conn->prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $name, $email, $hashed_password, $role);
    
    if ($stmt->execute()) {
        // Log them in immediately
        $_SESSION['user_id'] = $conn->insert_id;
        $_SESSION['role'] = $role;
        $_SESSION['name'] = $name;
        $_SESSION['email'] = $email;
        
        $redirect = $role === 'supervisor' ? '../views/profile-prof.html' : '../views/profile-student.html';
        
        // If it's a form submit, we might redirect. Let's return JSON or redirect based on request type
        // Since login.html uses form action directly without fetch, we should redirect.
        header("Location: " . $redirect);
        exit;
    } else {
        echo "Error: " . $conn->error;
    }
}
?>