<?php
session_start();
require_once 'Connect.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $content = $_POST['content'] ?? '';
    $receiver_id = $_POST['receiver_id'] ?? null;
    $user_id = $_SESSION['user_id'];
    $role = $_SESSION['role'];
    
    if (empty($project_id) && empty($receiver_id)) {
        if ($role === 'student') {
            $p_stmt = $conn->prepare("SELECT project_id FROM project_users WHERE user_id = ? LIMIT 1");
            $p_stmt->bind_param("i", $user_id);
            $p_stmt->execute();
            $p_res = $p_stmt->get_result();
            if ($p_res->num_rows > 0) {
                $project_id = $p_res->fetch_assoc()['project_id'];
            }
        }
    }
    
    // Insert notification for the receiver if it's a direct request
    if ($receiver_id) {
        $notif_msg = "New supervision request from " . $_SESSION['name'];
        $n_stmt = $conn->prepare("INSERT INTO notifications (user_id, message) VALUES (?, ?)");
        $n_stmt->bind_param("is", $receiver_id, $notif_msg);
        $n_stmt->execute();
    }

    $stmt = $conn->prepare("INSERT INTO messages (content, from_user, project_id) VALUES (?, ?, ?)");
    $stmt->bind_param("sii", $content, $user_id, $project_id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $conn->error]);
    }
}
?>