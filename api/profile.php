<?php
session_start();
include __DIR__ . "/Connect.php";

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

$user_id = $_SESSION['user_id'];

$res = mysqli_query($conn, "SELECT * FROM users WHERE id = $user_id");

$user = mysqli_fetch_assoc($res);

echo json_encode([
    "id" => $user['id'],
    "name" => $user['name'],
    "email" => $user['email'],
    "role" => $user['role'],
    "user_code" => $user['user_code'] 
]);
?>