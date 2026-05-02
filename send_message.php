<?php
session_start();
include "Connect.php";

if (!isset($_SESSION['user_id'])) {
    exit;
}

$sender_id = $_SESSION['user_id'];

if ($_POST) {
    $receiver_id = $_POST['receiver_id'];
    $message = $_POST['message'];

    mysqli_query($conn,
    "INSERT INTO messages (sender_id, receiver_id, message)
     VALUES ('$sender_id','$receiver_id','$message')");

    echo "Message sent!";
}
?>