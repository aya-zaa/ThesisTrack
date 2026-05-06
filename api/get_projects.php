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

$projects = [];

if ($role === 'supervisor') {
    $stmt = $conn->prepare("SELECT id, title, status FROM projects WHERE supervisor_id = ? ORDER BY id DESC");
    $stmt->bind_param("i", $user_id);
} else {
    $stmt = $conn->prepare("SELECT p.id, p.title, p.status, u.name as supervisor_name FROM projects p JOIN project_users pu ON p.id = pu.project_id JOIN users u ON p.supervisor_id = u.id WHERE pu.user_id = ? ORDER BY p.id DESC");
    $stmt->bind_param("i", $user_id);
}

$stmt->execute();
$result = $stmt->get_result();

while ($row = $result->fetch_assoc()) {
    $project_id = $row['id'];
    
    // Fetch students for this project
    $stud_stmt = $conn->prepare("SELECT u.id, u.name, u.email FROM users u JOIN project_users pu ON u.id = pu.user_id WHERE pu.project_id = ?");
    $stud_stmt->bind_param("i", $project_id);
    $stud_stmt->execute();
    $stud_res = $stud_stmt->get_result();
    
    $students = [];
    while ($stud_row = $stud_res->fetch_assoc()) {
        $students[] = [
            'id' => $stud_row['id'],
            'name' => $stud_row['name'],
            'email' => $stud_row['email']
        ];
    }
    
    $row['students'] = $students;
    
    // Fetch files and tasks so frontend logic is easier (or frontend can fetch them separately, but this matches the JSON structure localStorage had)
    // To keep it clean, we'll return just the project details, and files/tasks can be fetched via their own endpoints.
    // However, the current JS assumes `p.files` and `p.tasks` are present inside the projects array if it was fetched from localStorage.
    // We will update JS to use correct endpoints, so we don't need to nest them here unless needed.
    
    $projects[] = $row;
}

echo json_encode($projects);
?>
