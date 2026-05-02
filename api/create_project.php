<?php
session_start();
include "Connect.php";

if (!isset($_SESSION['user_id'])) {
    header("Location: login.html");
    exit;
}

$supervisor_id = $_SESSION['user_id']; // 🔥 بدل 1

if ($_POST) {
    $title = $_POST['title'];
    $emails = $_POST['emails'];

    mysqli_query($conn,
    "INSERT INTO projects (title, status, supervisor_id)
     VALUES ('$title','pending','$supervisor_id')");

    $project_id = mysqli_insert_id($conn);

    $emails_array = explode(",", $emails);

    foreach ($emails_array as $email) {

        $email = trim($email);

        if ($email == "") continue;

        $res = mysqli_query($conn,
        "SELECT id FROM users WHERE email='$email'");

        if (mysqli_num_rows($res) > 0) {

            $row = mysqli_fetch_assoc($res);
            $user_id = $row['id'];

        } else {

            $default_pass = md5("123");

            mysqli_query($conn,
            "INSERT INTO users (name,email,password,role,profile_completed)
             VALUES ('student','$email','$default_pass','student',0)");

            $user_id = mysqli_insert_id($conn);
        }

        mysqli_query($conn,
        "INSERT INTO project_users (user_id, project_id)
         VALUES ('$user_id','$project_id')");
    }

    echo "Project created successfully!";
}
?>

<form method="POST">
  <input name="title" placeholder="Project Title"><br><br>

  <input name="emails" 
  placeholder="email1,email2,email3"><br><br>

  <button>Create Project</button>
</form>