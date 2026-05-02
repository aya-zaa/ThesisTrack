<?php
session_start();
include __DIR__ . "/Connect.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    exit("Invalid request");
}

$email = trim($_POST['email']);
$password = $_POST['password'];

$stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();

$result = $stmt->get_result();
$user = $result->fetch_assoc();

if ($user && password_verify($password, $user['password'])) {

    $_SESSION['user_id'] = $user['id'];
    $_SESSION['role'] = $user['role'];

    if ($user['profile_completed'] == 0) {

        if ($user['role'] === "student") {
            header("Location: ../views/profile-student.html");
        } else {
            header("Location: ../views/profile-prof.html");
        }

    } else {

        if ($user['role'] === "student") {
echo json_encode([
    "success" => true,
    "role" => $user['role']
]);        } else {
            header("Location: ../views/Dashboard-prof.html");
        }
    }

    exit;

} else {
    echo "Wrong email or password";
}
?>