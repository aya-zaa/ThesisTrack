<?php
session_start();
include "Connect.php";

if (!isset($_SESSION['user_id'])) {
    header("Location: login.html");
    exit;
}

$supervisor_id = $_SESSION['user_id'];

if ($_POST) {
    $id = $_POST['file_id'];
    $status = $_POST['status'];
    $comment = $_POST['comment'];

    $check = mysqli_query($conn, "
    SELECT files.id FROM files
    JOIN projects ON files.project_id = projects.id
    WHERE files.id=$id AND projects.supervisor_id=$supervisor_id
    ");

    if (mysqli_num_rows($check) > 0) {

        mysqli_query($conn,
        "UPDATE files 
         SET status='$status', comment='$comment' 
         WHERE id=$id");

        echo "✔️ Updated";
    }
}

$res = mysqli_query($conn,
"SELECT id FROM projects WHERE supervisor_id=$supervisor_id");

while ($proj = mysqli_fetch_assoc($res)) {

    $project_id = $proj['id'];

    echo "<h3>Project ID: $project_id</h3>";

    $files = mysqli_query($conn,
    "SELECT * FROM files WHERE project_id=$project_id AND status='sent'");

    while ($file = mysqli_fetch_assoc($files)) {

        echo "<div style='border:1px solid #ccc; padding:10px; margin:10px;'>";

        echo "File: " . $file['name'] . "<br>";

        echo "<a href='uploads/" . $file['name'] . "' target='_blank'>Open File</a><br><br>";

        echo "Status: " . $file['status'] . "<br>";
        echo "Comment: " . $file['comment'] . "<br><br>";

        echo "<form method='POST'>";
        echo "<input type='hidden' name='file_id' value='".$file['id']."'>";

        echo "Status:
        <select name='status'>";

        $statuses = ["pending", "accepted", "rejected"];
        foreach ($statuses as $s) {
            $selected = ($file['status'] == $s) ? "selected" : "";
            echo "<option value='$s' $selected>$s</option>";
        }

        echo "</select><br><br>";

        echo "<input name='comment' value='".$file['comment']."' placeholder='Write comment'><br><br>";

        echo "<button>Send Review</button>";
        echo "</form>";

        echo "</div>";
    }
}
?>