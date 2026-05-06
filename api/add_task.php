<?php
session_start();
require_once 'Connect.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = $_POST['title'] ?? '';
    $desc = $_POST['note'] ?? ($_POST['desc'] ?? '');
    $deadline = $_POST['deadline'] ?? null;
    $status = $_POST['status'] ?? 'pending';
    $project_id = $_POST['project_id'] ?? null;
    
    if (empty($title)) {
        echo json_encode(['success' => false, 'message' => 'Title required']);
        exit;
    }
    
    $user_id = $_SESSION['user_id'];
    $role = $_SESSION['role'];
    
    if ($role === 'student' && empty($project_id)) {
        $p_stmt = $conn->prepare("SELECT project_id FROM project_users WHERE user_id = ? LIMIT 1");
        $p_stmt->bind_param("i", $user_id);
        $p_stmt->execute();
        $p_res = $p_stmt->get_result();
        if ($p_res->num_rows > 0) {
            $project_id = $p_res->fetch_assoc()['project_id'];
        } else {
            echo json_encode(['success' => false, 'message' => 'No project assigned']);
            exit;
        }
    }
    
    if (empty($project_id)) {
        echo json_encode(['success' => false, 'message' => 'Project ID required']);
        exit;
    }
    
    $stmt = $conn->prepare("INSERT INTO tasks (title, desc_text, status, deadline, project_id, created_by, type) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssiis", $title, $desc, $status, $deadline, $project_id, $user_id, $role);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Database error']);
    }
}
?>