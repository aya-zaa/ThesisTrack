<?php
session_start();
require __DIR__ . "/Connect.php";

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $name = trim($_POST['name']);
    $email = trim($_POST['email']);
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);
    $role = $_POST['role'];

    $code = "USR" . rand(1000,9999);
    $zero = 0;

    $check = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $check->bind_param("s", $email);
    $check->execute();
    $check->store_result();

    if ($check->num_rows > 0) {
        echo "Email already exists";
        exit;
    }

    $stmt = $conn->prepare(
        "INSERT INTO users (name,email,password,role,profile_completed,user_code)
         VALUES (?,?,?,?,?,?)"
    );

    $stmt->bind_param("ssssis", $name, $email, $password, $role, $zero, $code);

    if ($stmt->execute()) {

        $user_id = $stmt->insert_id;

        $_SESSION['user_id'] = $user_id;
        $_SESSION['role'] = $role;

        if ($role === "student") {
            header("Location: ../views/profile-student.html");
        } else {
            header("Location: ../views/profile-prof.html");
        }

        exit;

    } else {
        die("❌ ERROR: " . $stmt->error);
    }
}
?>