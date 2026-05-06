<?php
session_start();
require_once 'Connect.php';

header('Content-Type: application/json');

// Clear any previous output buffers to ensure clean JSON
if (ob_get_length()) ob_clean();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';

    if (empty($email) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Email and password required']);
        exit;
    }

    $stmt = $conn->prepare("SELECT id, name, password, role FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();
        $login_success = false;

        if (password_verify($password, $user['password'])) {
            $login_success = true;
        } elseif ($password === $user['password']) {
            // Support legacy plain text passwords and upgrade them
            $hashed = password_hash($password, PASSWORD_DEFAULT);
            $updatePass = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
            $updatePass->bind_param("si", $hashed, $user['id']);
            $updatePass->execute();
            $login_success = true;
        }

        if ($login_success) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['role'] = $user['role'];
            $_SESSION['name'] = $user['name'];
            $_SESSION['email'] = $email;
            
            // Try to update availability (ignore errors if column doesn't exist)
            @$conn->query("UPDATE users SET available = TRUE WHERE id = " . (int)$user['id']);

            echo json_encode(['success' => true, 'role' => $user['role'], 'name' => $user['name']]);
            exit;
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
            exit;
        }
    }
    
    echo json_encode(['success' => false, 'message' => 'User not found']);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>