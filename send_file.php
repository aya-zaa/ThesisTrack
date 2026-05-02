<?php
include __DIR__ . "/Connect.php";

$id = $_POST['id'];

mysqli_query($conn,
"UPDATE files SET status='sent' WHERE id=$id");

echo "sent";
?>