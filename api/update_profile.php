<?php
session_start();
include __DIR__ . "/Connect.php";

if (!isset($_SESSION['user_id'])) {
    exit("Unauthorized");
}

$user_id = $_SESSION['user_id'];

$name = $_POST['name'];

$stmt = $conn->prepare(
    "UPDATE users SET name=?, profile_completed=1 WHERE id=?"
);
$stmt->bind_param("si", $name, $user_id);

if ($stmt->execute()) {

    if ($_SESSION['role'] === "student") {
        header("Location: ../views/dashboard-student.html");
    } else {
        header("Location: ../views/Dashboard-prof.html");
    }

    exit;

} else {
    echo "Error updating profile";
}
?>