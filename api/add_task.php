<?php
session_start();
include "Connect.php";

if (!isset($_SESSION['user_id']) || $_SESSION['role'] != "professor") {
    header("Location: login.html");
    exit;
}

$supervisor_id = $_SESSION['user_id'];

if ($_POST) {
    $title = $_POST['title'];
    $project_id = $_POST['project_id'];
    $due_date = $_POST['due_date'];
    $note = $_POST['note'];

    $check = mysqli_query($conn,
    "SELECT * FROM projects 
     WHERE id=$project_id AND supervisor_id=$supervisor_id");

    if (mysqli_num_rows($check) > 0) {

        mysqli_query($conn,
        "INSERT INTO tasks 
        (title, status, project_id, created_by, type, due_date, note)
        VALUES 
        ('$title', 'pending', '$project_id', '$supervisor_id', 'supervisor', '$due_date', '$note')");

        echo "✔️ Task added!";
    } else {
        echo "❌ Invalid project!";
    }
}
?>

<form method="POST">

  <input name="title" placeholder="Task title"><br><br>

  <input type="date" name="due_date"><br><br>

  <input name="note" placeholder="Note"><br><br>

  <select name="project_id">
    <?php
    $res = mysqli_query($conn,
    "SELECT id FROM projects WHERE supervisor_id=$supervisor_id");

    while ($p = mysqli_fetch_assoc($res)) {
        echo "<option value='".$p['id']."'>Project ".$p['id']."</option>";
    }
    ?>
  </select><br><br>

  <button>Add Task</button>

</form>