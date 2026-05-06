<?php
session_start();
require_once 'Connect.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? '';
    $status = $_POST['status'] ?? null;
    $title = $_POST['title'] ?? null;
    $desc = $_POST['desc'] ?? null;
    $deadline = $_POST['deadline'] ?? null;
    
    if (empty($id)) {
        echo json_encode(['success' => false, 'message' => 'Task ID required']);
        exit;
    }
    
    // Build dynamic query
    $updates = [];
    $params = [];
    $types = '';
    
    if ($status !== null) {
        $updates[] = "status = ?";
        $params[] = $status;
        $types .= 's';
    }
    if ($title !== null) {
        $updates[] = "title = ?";
        $params[] = $title;
        $types .= 's';
    }
    if ($desc !== null) {
        $updates[] = "desc_text = ?";
        $params[] = $desc;
        $types .= 's';
    }
    if ($deadline !== null && !empty($deadline)) {
        $updates[] = "deadline = ?";
        $params[] = $deadline;
        $types .= 's';
    }
    
    if (empty($updates)) {
        echo json_encode(['success' => true]); // nothing to update
        exit;
    }
    
    $params[] = $id;
    $types .= 'i';
    
    $sql = "UPDATE tasks SET " . implode(', ', $updates) . " WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Database error']);
    }
}
?>
