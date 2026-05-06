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

$files = [];

if ($role === 'supervisor') {
    // Supervisor gets all files from their projects EXCEPT 'draft'
    $stmt = $conn->prepare("SELECT f.id, f.name, f.type, f.size, f.status, f.comment as notes, f.feedback, f.created_at as date, p.title as project, u.name as student FROM files f JOIN projects p ON f.project_id = p.id JOIN users u ON f.user_id = u.id WHERE p.supervisor_id = ? AND f.status != 'draft' ORDER BY f.id DESC");
    $stmt->bind_param("i", $user_id);
} else {
    // Student gets all files from projects they are in
    $stmt = $conn->prepare("SELECT f.id, f.name, f.type, f.size, f.status, f.comment as notes, f.feedback, f.created_at as date FROM files f JOIN project_users pu ON f.project_id = pu.project_id WHERE pu.user_id = ? ORDER BY f.id DESC");
    $stmt->bind_param("i", $user_id);
}

$stmt->execute();
$result = $stmt->get_result();

while ($row = $result->fetch_assoc()) {
    // format date for JS (frontend expects e.g., "12 Oct 2024")
    $date = new DateTime($row['date']);
    $row['date'] = $date->format('d M Y');
    
    // Convert size to MB for frontend display if needed, or JS will do it
    // JS does: (file.size / (1024 * 1024)).toFixed(2) + " MB" if it receives raw bytes.
    // Let's keep it as raw bytes or just leave it as stored (string).
    
    // Adjust type
    $row['type'] = strtoupper($row['type']);
    $files[] = $row;
}

echo json_encode($files);
?>