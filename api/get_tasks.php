<?php
session_start();
require_once 'Connect.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$user_id = $_SESSION['user_id'];
$role = $_SESSION['role'];
$project_id = $_GET['project_id'] ?? null;

$tasks = [];

if ($role === 'student') {
    // For student, fetch tasks from their project
    $stmt = $conn->prepare("SELECT t.id, t.title, t.desc_text as `desc`, t.status, t.deadline, t.type as created_type, u.name as created_by_name FROM tasks t JOIN project_users pu ON t.project_id = pu.project_id LEFT JOIN users u ON t.created_by = u.id WHERE pu.user_id = ? ORDER BY t.id DESC");
    $stmt->bind_param("i", $user_id);
} else {
    // For supervisor, fetch tasks for a specific project
    if (empty($project_id)) {
        echo json_encode([]); // need project id
        exit;
    }
    $stmt = $conn->prepare("SELECT t.id, t.title, t.desc_text as `desc`, t.status, t.deadline, t.type as created_type, u.name as created_by_name FROM tasks t LEFT JOIN users u ON t.created_by = u.id WHERE t.project_id = ? ORDER BY t.id DESC");
    $stmt->bind_param("i", $project_id);
}

$stmt->execute();
$result = $stmt->get_result();

while ($row = $result->fetch_assoc()) {
    // JS student.js expects `supervisor: boolean` instead of `created_type: 'supervisor'`
    $row['supervisor'] = ($row['created_type'] === 'supervisor');
    
    $tasks[] = $row;
}

echo json_encode($tasks);
?>
