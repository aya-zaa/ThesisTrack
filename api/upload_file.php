<?php
session_start();
require_once 'Connect.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'student') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user_id = $_SESSION['user_id'];
    $notes = $_POST['notes'] ?? '';
    $type = $_POST['type'] ?? 'DOCX';
    
    // Find student's project (assuming 1 project for now, as frontend doesn't send project_id)
    $p_stmt = $conn->prepare("SELECT project_id FROM project_users WHERE user_id = ? LIMIT 1");
    $p_stmt->bind_param("i", $user_id);
    $p_stmt->execute();
    $p_res = $p_stmt->get_result();
    
    if ($p_res->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'You are not assigned to any project']);
        exit;
    }
    $project_id = $p_res->fetch_assoc()['project_id'];

    if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
        $file_tmp = $_FILES['file']['tmp_name'];
        $file_name = $_FILES['file']['name'];
        $file_size = $_FILES['file']['size']; // bytes
        
        $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
        $allowed = ['pdf', 'docx', 'doc', 'zip', 'pptx', 'txt'];
        
        if (!in_array($file_ext, $allowed)) {
            echo json_encode(['success' => false, 'message' => 'File type not allowed. Use PDF, DOCX, ZIP, etc.']);
            exit;
        }

        $upload_dir = '../uploads/';
        if (!is_dir($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }
        
        // Generate unique name
        $new_name = time() . '_' . preg_replace("/[^a-zA-Z0-9.]/", "_", $file_name);
        $dest = $upload_dir . $new_name;
        
        if (move_uploaded_file($file_tmp, $dest)) {
            // size formatting: convert bytes to readable string
            $size_str = round($file_size / 1024, 2) . ' KB';
            if ($file_size > 1048576) $size_str = round($file_size / 1048576, 2) . ' MB';

            $stmt = $conn->prepare("INSERT INTO files (name, type, size, status, comment, user_id, project_id) VALUES (?, ?, ?, 'draft', ?, ?, ?)");
            $stmt->bind_param("ssssii", $new_name, $type, $size_str, $notes, $user_id, $project_id);
            if ($stmt->execute()) {
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['success' => false, 'message' => 'DB error']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to move file']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'No file uploaded or upload error']);
    }
}
?>