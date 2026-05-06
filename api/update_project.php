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
    $status = $_POST['status'] ?? '';
    
    if (empty($id) || empty($status)) {
        echo json_encode(['success' => false, 'message' => 'Missing fields']);
        exit;
    }
    
    $supervisor_id = $_SESSION['user_id'];
    
    $stmt = $conn->prepare("UPDATE projects SET status = ? WHERE id = ? AND supervisor_id = ?");
    $stmt->bind_param("sii", $status, $id, $supervisor_id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Database error']);
    }
}
?>
