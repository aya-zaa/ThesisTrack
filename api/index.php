<?php
session_start();
include "Connect.php";

if (!isset($_SESSION['user_id'])) {
    header("Location: login.html");
    exit;
}

$supervisor_id = $_SESSION['user_id'];

// 🔴 DELETE (غير مشاريع الأستاذ)
if (isset($_GET['delete'])) {
    $id = $_GET['delete'];

    mysqli_query($conn, 
    "DELETE FROM projects 
     WHERE id=$id AND supervisor_id=$supervisor_id");
}

// 🟡 UPDATE
if (isset($_POST['update'])) {
    $id = $_POST['id'];
    $title = $_POST['title'];
    $status = $_POST['status'];

    mysqli_query($conn, 
    "UPDATE projects SET 
        title='$title', 
        status='$status' 
     WHERE id=$id AND supervisor_id=$supervisor_id");
}

// 🟢 SELECT (غير مشاريع الأستاذ)
$result = mysqli_query($conn, 
"SELECT * FROM projects WHERE supervisor_id=$supervisor_id");

while ($row = mysqli_fetch_assoc($result)) {

    echo "<form method='POST'>";
    echo "<input type='hidden' name='id' value='".$row['id']."'>";

    echo "Title: <input name='title' value='".$row['title']."'><br>";
    echo "Status: <input name='status' value='".$row['status']."'><br>";

    echo "<button name='update'>Update</button> ";
    echo "<a href='?delete=".$row['id']."'>Delete</a>";

    echo "<br>----------------------</form><br>";
}
?>