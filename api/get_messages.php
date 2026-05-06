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

$messages = [];

// Get projects for this user
$project_ids = [];
if ($role === 'supervisor') {
    $p_stmt = $conn->prepare("SELECT id, title FROM projects WHERE supervisor_id = ?");
    $p_stmt->bind_param("i", $user_id);
} else {
    $p_stmt = $conn->prepare("SELECT p.id, p.title FROM projects p JOIN project_users pu ON p.id = pu.project_id WHERE pu.user_id = ?");
    $p_stmt->bind_param("i", $user_id);
}
$p_stmt->execute();
$p_res = $p_stmt->get_result();
$projects_map = [];
while ($p = $p_res->fetch_assoc()) {
    $project_ids[] = $p['id'];
    $projects_map[$p['id']] = $p['title'];
}

if (!empty($project_ids)) {
    $in = str_repeat('?,', count($project_ids) - 1) . '?';
    $sql = "SELECT m.id, m.content, m.created_at, u.name as from_name, m.project_id FROM messages m JOIN users u ON m.from_user = u.id WHERE m.project_id IN ($in) ORDER BY m.id ASC";
    $stmt = $conn->prepare($sql);
    $types = str_repeat('i', count($project_ids));
    $stmt->bind_param($types, ...$project_ids);
    $stmt->execute();
    $result = $stmt->get_result();
    
    while ($row = $result->fetch_assoc()) {
        $date = new DateTime($row['created_at']);
        // Format for frontend
        $messages[] = [
            'id' => $row['id'],
            'from' => $row['from_name'],
            'to' => 'Project: ' . $projects_map[$row['project_id']],
            'project_id' => $row['project_id'],
            'subject' => 'Group Chat',
            'content' => $row['content'],
            'date' => $date->format('d M Y H:i')
        ];
    }
}

echo json_encode($messages);
?>
