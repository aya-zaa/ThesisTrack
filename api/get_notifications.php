<?php
session_start();
require_once 'Connect.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$user_id = $_SESSION['user_id'];
$notifications = [];

$stmt = $conn->prepare("SELECT id, message, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY id DESC LIMIT 50");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

while ($row = $result->fetch_assoc()) {
    $date = new DateTime($row['created_at']);
    $row['date'] = $date->format('d M Y H:i');
    $notifications[] = $row;
}

echo json_encode($notifications);
?>
