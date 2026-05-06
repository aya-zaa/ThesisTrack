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
    
    if (empty($id)) {
        echo json_encode(['success' => false, 'message' => 'File ID required']);
        exit;
    }
    
    $user_id = $_SESSION['user_id'];
    
    $stmt = $conn->prepare("UPDATE files SET status = 'pending' WHERE id = ? AND user_id = ? AND status = 'draft'");
    $stmt->bind_param("ii", $id, $user_id);
    
    if ($stmt->execute() && $stmt->affected_rows > 0) {
        // Notification logic could go here
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Could not send file']);
    }
}
?>