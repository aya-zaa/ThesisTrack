<?php
session_start();
include "Connect.php";

if (!isset($_SESSION['user_id'])) {
    header("Location: login.html");
    exit;
}

$supervisor_id = $_SESSION['user_id'];

if ($_POST) {
    $title = $_POST['title'];
    $status = $_POST['status'];

    mysqli_query($conn, 
    "INSERT INTO projects (title, status, supervisor_id) 
     VALUES ('$title','$status','$supervisor_id')");
}
?>

<form method="POST">
  <input name="title" placeholder="Project Title"><br><br>
  
  <input name="status" placeholder="Status"><br><br>

  <button>Add Project</button>
</form>