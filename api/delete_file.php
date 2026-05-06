<?php
session_start();
require_once 'Connect.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$id = $_POST['id'] ?? '';
$user_id = $_SESSION['user_id'];

if (empty($id)) {
    echo json_encode(['success' => false, 'message' => 'ID required']);
    exit;
}

// Ensure the file belongs to the user or they are a supervisor
$stmt = $conn->prepare("SELECT name, user_id FROM files WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'File not found']);
    exit;
}

$file = $result->fetch_assoc();

if ($_SESSION['role'] !== 'supervisor' && $file['user_id'] != $user_id) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized to delete this file']);
    exit;
}

$file_path = "../uploads/" . $file['name'];

if (file_exists($file_path)) {
    unlink($file_path);
}

$del_stmt = $conn->prepare("DELETE FROM files WHERE id = ?");
$del_stmt->bind_param("i", $id);

if ($del_stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Database error']);
}
?>