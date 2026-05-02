<?php
session_start();
include "Connect.php";

if (!isset($_SESSION['user_id']) || $_SESSION['role'] != "professor") {
    header("Location: login.html");
    exit;
}

$supervisor_id = $_SESSION['user_id'];

$result = mysqli_query($conn,
"SELECT * FROM projects WHERE supervisor_id=$supervisor_id");

if (mysqli_num_rows($result) == 0) {
    echo "No projects yet.";
    exit;
}

while ($project = mysqli_fetch_assoc($result)) {

    echo "<div style='border:1px solid #ccc; padding:15px; margin:15px; border-radius:8px;'>";

    echo "<strong>Title:</strong> " . $project['title'] . "<br>";
    echo "<strong>Status:</strong> " . $project['status'] . "<br><br>";

    echo "<a href='supervisor_files.php?project_id=".$project['id']."'>📂 View Files</a><br>";
    echo "<a href='add_task.php?project_id=".$project['id']."'>📝 Add Task</a>";

    echo "</div>";
}
?>