<?php
session_start();
require_once 'Connect.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['logged_in' => false]);
    exit;
}

$user_id = $_SESSION['user_id'];
$stmt = $conn->prepare("SELECT id, name, email, role, field, phone, available, department, enrollment_date FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $user = $result->fetch_assoc();
    
    // Ensure role is set for prefix
    $role = $user['role'] ?? 'student';
    $prefix = ($role === 'student') ? 'STD-' : 'PROF-';
    
    // Generate Display ID - ensure it uses the ID from DB
    $user['display_id'] = $prefix . str_pad($user['id'], 3, '0', STR_PAD_LEFT);
    
    $user['logged_in'] = true;
    echo json_encode($user);
} else {
    // Session exists but user not found in DB
    session_destroy();
    echo json_encode(['logged_in' => false]);
}
?>
