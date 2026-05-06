<?php
session_start();
include "Connect.php";

if (!isset($_SESSION['user_id']) || $_SESSION['role'] != "professor") {
    header("Location: login.html");
    exit;
}

$supervisor_id = $_SESSION['user_id'];



$resUser = mysqli_query($conn,
"SELECT * FROM users WHERE id=$supervisor_id");

$user = mysqli_fetch_assoc($resUser);

echo "<h2>Welcome, " . $user['name'] . "</h2>";


$resCount = mysqli_query($conn,
"SELECT COUNT(*) as total FROM projects WHERE supervisor_id=$supervisor_id");

$count = mysqli_fetch_assoc($resCount);

echo "<p>Total Projects: " . $count['total'] . "</p><hr>";


echo "<h3>Student Projects</h3>";

$projects = mysqli_query($conn,
"SELECT * FROM projects WHERE supervisor_id=$supervisor_id");

while ($p = mysqli_fetch_assoc($projects)) {

    echo "<div style='border:1px solid #ccc; padding:10px; margin:10px;'>";

    echo "Title: " . $p['title'] . "<br>";
    echo "Status: " . $p['status'] . "<br>";

    echo "<a href='supervisor_files.php?project_id=".$p['id']."'>Open</a>";

    echo "</div>";
}


echo "<h3>Recent Files</h3>";

$files = mysqli_query($conn,
"SELECT f.* FROM files f
 JOIN projects p ON f.project_id = p.id
 WHERE p.supervisor_id=$supervisor_id 
 AND f.is_submitted=1
 ORDER BY f.id DESC LIMIT 5");

while ($f = mysqli_fetch_assoc($files)) {

    echo "<div>";

    echo $f['name'] . " - " . $f['status'];

    echo "</div>";
}
?>