<?php
session_start();
require_once 'Connect.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'supervisor') {
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = $_POST['title'] ?? '';
    $status = $_POST['status'] ?? 'in-progress';
    $emails_str = $_POST['emails'] ?? '';
    
    if (empty($title)) {
        echo json_encode(['success' => false, 'message' => 'Project title required']);
        exit;
    }
    
    $supervisor_id = $_SESSION['user_id'];
    
    // Create project
    $stmt = $conn->prepare("INSERT INTO projects (title, status, supervisor_id) VALUES (?, ?, ?)");
    $stmt->bind_param("ssi", $title, $status, $supervisor_id);
    if ($stmt->execute()) {
        $project_id = $conn->insert_id;
        
        // Link students
        if (!empty($emails_str)) {
            $emails = explode(',', $emails_str);
            foreach ($emails as $email) {
                $email = trim($email);
                if (empty($email)) continue;
                
                // Find student user_id
                $s_stmt = $conn->prepare("SELECT id FROM users WHERE email = ? AND role = 'student'");
                $s_stmt->bind_param("s", $email);
                $s_stmt->execute();
                $s_res = $s_stmt->get_result();
                
                if ($s_res->num_rows > 0) {
                    $student = $s_res->fetch_assoc();
                    $student_id = $student['id'];
                    
                    $link_stmt = $conn->prepare("INSERT IGNORE INTO project_users (project_id, user_id) VALUES (?, ?)");
                    $link_stmt->bind_param("ii", $project_id, $student_id);
                    $link_stmt->execute();
                }
            }
        }
        
        echo json_encode(['success' => true, 'project_id' => $project_id]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Database error']);
    }
}
?>