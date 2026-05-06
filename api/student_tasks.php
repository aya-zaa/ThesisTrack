<?php
session_start();
include "Connect.php";

if (!isset($_SESSION['user_id']) || $_SESSION['role'] != "student") {
    header("Location: login.html");
    exit;
}

$user_id = $_SESSION['user_id'];

$res = mysqli_query($conn,
"SELECT project_id FROM project_users WHERE user_id=$user_id LIMIT 1");

$row = mysqli_fetch_assoc($res);

if (!$row) {
    echo "No project assigned!";
    exit;
}

$project_id = $row['project_id'];

if (isset($_POST['add'])) {
    $title = $_POST['title'];

    mysqli_query($conn,
    "INSERT INTO tasks (title, status, project_id, created_by, type)
     VALUES ('$title', 'pending', '$project_id', '$user_id', 'team')");
}

if (isset($_GET['delete'])) {
    $id = $_GET['delete'];

    mysqli_query($conn,
    "DELETE FROM tasks 
     WHERE id=$id AND type='team' AND project_id=$project_id");
}

$result = mysqli_query($conn,
"SELECT * FROM tasks WHERE project_id=$project_id");

while ($task = mysqli_fetch_assoc($result)) {

    echo "<div style='border:1px solid #ccc; padding:10px; margin:10px;'>";

    echo "Title: " . $task['title'] . "<br>";
    echo "Status: " . $task['status'] . "<br>";

    if ($task['type'] == "supervisor") {
        echo "👨‍🏫 From Supervisor<br>";
        echo "Due: " . $task['due_date'] . "<br>";
        echo "Note: " . $task['note'] . "<br>";
    }

    if ($task['type'] == "team") {
        echo "<a href='?delete=".$task['id']."'>Delete</a>";
    }

    echo "</div>";
}
?>

<form method="POST">
  <input name="title" placeholder="My Task"><br><br>
  <button name="add">Add Task</button>
</form>