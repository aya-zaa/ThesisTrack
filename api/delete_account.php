<?php
session_start();
require_once 'Connect.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$user_id = $_SESSION['user_id'];

// Start transaction to delete all related data
$conn->begin_transaction();

try {
    // Delete files (optional: also unlink from disk)
    $stmt = $conn->prepare("SELECT name FROM files WHERE user_id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $res = $stmt->get_result();
    while ($row = $res->fetch_assoc()) {
        $path = "../uploads/" . $row['name'];
        if (file_exists($path)) unlink($path);
    }
    
    $conn->query("DELETE FROM files WHERE user_id = $user_id");
    $conn->query("DELETE FROM tasks WHERE created_by = $user_id");
    $conn->query("DELETE FROM project_users WHERE user_id = $user_id");
    $conn->query("DELETE FROM notifications WHERE user_id = $user_id");
    $conn->query("DELETE FROM users WHERE id = $user_id");

    $conn->commit();
    session_destroy();
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['success' => false, 'message' => 'Error deleting account: ' . $e->getMessage()]);
}
?>
