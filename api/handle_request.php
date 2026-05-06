<?php
session_start();
include "Connect.php";

$supervisor_id = $_SESSION['user_id'];

if (isset($_POST['accept'])) {

    $student_id = $_POST['student_id'];

    $res = mysqli_query($conn,
    "SELECT id FROM projects WHERE supervisor_id=$supervisor_id LIMIT 1");

    $project = mysqli_fetch_assoc($res);
    $project_id = $project['id'];

    mysqli_query($conn,
    "INSERT INTO project_users (user_id, project_id)
     VALUES ('$student_id','$project_id')");

    echo "Student added to project!";
}

if (isset($_POST['reject'])) {
    echo "Request rejected";
}
?>