<?php
session_start();
require_once 'Connect.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$stmt = $conn->prepare("SELECT id, name, email, field, available, department FROM users WHERE role = 'supervisor'");
$stmt->execute();
$result = $stmt->get_result();

$supervisors = [];
while ($row = $result->fetch_assoc()) {
    $supervisors[] = $row;
}

echo json_encode($supervisors);
?>
