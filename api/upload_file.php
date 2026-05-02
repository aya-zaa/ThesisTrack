<?php
session_start();
include __DIR__ . "/Connect.php";

$user_id = $_SESSION['user_id'] ?? 1;

$res = mysqli_query($conn,
"SELECT project_id FROM project_users WHERE user_id=$user_id");

if (!$res) {
    die("Query error");
}

$row = mysqli_fetch_assoc($res);

if (!$row) {
    echo "No project";
    exit;
}

$project_id = $row['project_id'];

if (isset($_FILES['file'])) {

    $file_name = $_FILES['file']['name'];
    $tmp = $_FILES['file']['tmp_name'];

    $comment = $_POST['notes'] ?? "";

    $status = isset($_POST['send_now']) ? "sent" : "pending";

    $path = __DIR__ . "/../uploads/" . $file_name;

    if (move_uploaded_file($tmp, $path)) {

        $query = "INSERT INTO files (name, status, comment, user_id, project_id)
                  VALUES ('$file_name','$status','$comment','$user_id','$project_id')";

        if (!mysqli_query($conn, $query)) {
            die("Insert error: " . mysqli_error($conn));
        }

        header("Location: ../views/files-student.html");
        exit;

    } else {
        echo "❌ Upload failed";
    }
}
?>