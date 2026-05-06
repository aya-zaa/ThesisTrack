<?php
session_start();
require_once 'Connect.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'supervisor') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? '';
    $status = $_POST['status'] ?? ''; // 'reviewed', 'approved', 'rejected'
    $feedback = $_POST['feedback'] ?? '';
    
    if (empty($id) || empty($status)) {
        echo json_encode(['success' => false, 'message' => 'Missing data']);
        exit;
    }
    
    $supervisor_id = $_SESSION['user_id'];
    
    // Ensure the file belongs to a project supervised by this user
    $check = $conn->prepare("SELECT f.id FROM files f JOIN projects p ON f.project_id = p.id WHERE f.id = ? AND p.supervisor_id = ?");
    $check->bind_param("ii", $id, $supervisor_id);
    $check->execute();
    if ($check->get_result()->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized for this file']);
        exit;
    }
    
    $stmt = $conn->prepare("UPDATE files SET status = ?, feedback = ? WHERE id = ?");
    $stmt->bind_param("ssi", $status, $feedback, $id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Database error']);
    }
}
?>
