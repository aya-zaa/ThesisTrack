<?php
session_start();
include "Connect.php";

if (!isset($_SESSION['user_id'])) {
    header("Location: login.html");
    exit;
}

$supervisor_id = $_SESSION['user_id'];

if ($_POST) {
    $email = $_POST['email'];
    $project_id = $_POST['project_id'];

    $res = mysqli_query($conn,
    "SELECT id FROM users WHERE email='$email'");

    if (mysqli_num_rows($res) > 0) {

        $row = mysqli_fetch_assoc($res);
        $user_id = $row['id'];

        $check = mysqli_query($conn,
        "SELECT * FROM projects 
         WHERE id=$project_id AND supervisor_id=$supervisor_id");

        if (mysqli_num_rows($check) > 0) {

            mysqli_query($conn,
            "INSERT INTO project_users (user_id, project_id)
             VALUES ('$user_id','$project_id')");

            echo "Student added successfully!";
        } else {
            echo "You don't own this project!";
        }

    } else {
        echo "User not found!";
    }
}
?>

<form method="POST">

  <input name="email" placeholder="Student Email"><br><br>

  <input name="project_id" placeholder="Project ID"><br><br>

  <button>Add Student</button>

</form>