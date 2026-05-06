<?php
session_start();
include __DIR__ . "/Connect.php";

header("Content-Type: application/json");

if (!isset($_SESSION['user_id']) || $_SESSION['role'] != "student") {
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

$user_id = $_SESSION['user_id'];

// ===== PROJECT =====
$res = mysqli_query($conn,
"SELECT p.* FROM projects p
 JOIN project_users pu ON p.id = pu.project_id
 WHERE pu.user_id = $user_id LIMIT 1");

$project = mysqli_fetch_assoc($res);

if (!$project) {
    echo json_encode(["error" => "No project"]);
    exit;
}

$project_id = $project['id'];

// ===== USER =====
$userRes = mysqli_query($conn,
"SELECT name FROM users WHERE id=$user_id");
$user = mysqli_fetch_assoc($userRes);

// ===== TASKS =====
$tasks = [];
$q1 = mysqli_query($conn,
"SELECT title, status, due_date FROM tasks 
 WHERE project_id=$project_id AND type='team'");

while ($t = mysqli_fetch_assoc($q1)) {
    $tasks[] = [
        "title" => $t['title'],
        "status" => $t['status'],
        "deadline" => $t['due_date']
    ];
}

// ===== FILES =====
$files = [];
$q2 = mysqli_query($conn,
"SELECT name, status FROM files 
 WHERE project_id=$project_id 
 ORDER BY id DESC LIMIT 3");

while ($f = mysqli_fetch_assoc($q2)) {
    $files[] = [
        "name" => $f['name'],
        "status" => $f['status']
    ];
}

$notifications = [
    ["text" => "Project updated"],
    ["text" => "New task assigned"]
];

// ===== OUTPUT =====
echo json_encode([
    "user" => $user,
    "project" => [
        "title" => $project['title'],
        "supervisor" => $project['supervisor_id'] ?? "Unknown",
        "status" => $project['status'] ?? "In Progress"
    ],
    "tasks" => $tasks,
    "files" => $files,
    "notifications" => $notifications
]);