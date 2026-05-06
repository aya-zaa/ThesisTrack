<?php
session_start();
include "Connect.php";

if (!isset($_SESSION['user_id'])) {
    header("Location: login.html");
    exit;
}

$user_id = $_SESSION['user_id'];

$res = mysqli_query($conn,
"SELECT project_id FROM project_users WHERE user_id=$user_id LIMIT 1");

$row = mysqli_fetch_assoc($res);

if (!$row) {
    echo "No project";
    exit;
}

$project_id = $row['project_id'];


if (isset($_POST['send'])) {
    $file_id = $_POST['file_id'];

    mysqli_query($conn,
    "UPDATE files 
     SET is_submitted=1 
     WHERE id=$file_id AND user_id=$user_id");
}


$files = mysqli_query($conn,
"SELECT * FROM files WHERE user_id=$user_id AND project_id=$project_id");

while ($file = mysqli_fetch_assoc($files)) {

    echo "<div style='border:1px solid #ccc; padding:10px; margin:10px;'>";

    echo "File: " . $file['name'] . "<br>";
    echo "Status: " . $file['status'] . "<br>";
    echo "Comment: " . $file['comment'] . "<br>";

    if ($file['is_submitted'] == 0) {
        echo "
        <form method='POST'>
            <input type='hidden' name='file_id' value='".$file['id']."'>
            <button name='send'>Send to Supervisor</button>
        </form>
        ";
    } else {
        echo "✔️ Sent";
    }

    echo "</div>";
}
?>