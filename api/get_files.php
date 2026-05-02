<?php
session_start();
include __DIR__ . "/Connect.php";

error_reporting(0);
header('Content-Type: application/json');

$user_id = $_SESSION['user_id'] ?? 1;

$res = mysqli_query($conn,
"SELECT project_id FROM project_users WHERE user_id=$user_id");

if (!$res) {
    echo json_encode([]);
    exit;
}

$row = mysqli_fetch_assoc($res);

if (!$row) {
    echo json_encode([]);
    exit;
}

$project_id = $row['project_id'];

$result = mysqli_query($conn,
"SELECT * FROM files WHERE project_id=$project_id");

$data = [];

while ($file = mysqli_fetch_assoc($result)) {

    $file_path = __DIR__ . "/../uploads/" . $file['name'];

    if (file_exists($file_path)) {
        $file['size'] = round(filesize($file_path)/1024/1024, 2) . " MB";
    } else {
        $file['size'] = "0 MB";
    }

    $file['date'] = "Today";

    $data[] = $file;
}

echo json_encode($data);