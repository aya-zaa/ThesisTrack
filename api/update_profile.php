<?php
session_start();
require_once 'Connect.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$user_id = $_SESSION['user_id'];
$name = $_POST['name'] ?? '';
$phone = $_POST['phone'] ?? '';
$field = $_POST['field'] ?? '';
$available = isset($_POST['available']) ? ($_POST['available'] === 'true' || $_POST['available'] === '1' || $_POST['available'] === 'Available') : true;

$department = $_POST['department'] ?? '';
$date = $_POST['date'] ?? null;

if (empty($name)) {
    echo json_encode(['success' => false, 'message' => 'Name is required']);
    exit;
}

$stmt = $conn->prepare("UPDATE users SET name = ?, phone = ?, field = ?, department = ?, enrollment_date = ? WHERE id = ?");
$stmt->bind_param("sssssi", $name, $phone, $field, $department, $date, $user_id);

if ($stmt->execute()) {
    $_SESSION['name'] = $name;
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $conn->error]);
}
?>