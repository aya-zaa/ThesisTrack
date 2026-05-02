<?php
include __DIR__ . "/Connect.php";

$id = $_POST['id'];

$res = mysqli_query($conn, "SELECT name FROM files WHERE id=$id");
$row = mysqli_fetch_assoc($res);

$file_path = __DIR__ . "/../uploads/" . $row['name'];

if (file_exists($file_path)) {
    unlink($file_path);
}

mysqli_query($conn, "DELETE FROM files WHERE id=$id");

echo "deleted";
?>