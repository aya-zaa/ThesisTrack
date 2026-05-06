<?php
session_start();
include "Connect.php";

$user_id = $_SESSION['user_id'];

$res = mysqli_query($conn,
"SELECT m.*, u.name 
 FROM messages m
 JOIN users u ON m.sender_id = u.id
 WHERE m.receiver_id = $user_id
 ORDER BY m.id DESC");

while ($msg = mysqli_fetch_assoc($res)) {

    echo "<div style='border:1px solid #ccc; margin:10px; padding:10px;'>";

    echo "<strong>From:</strong> " . $msg['name'] . "<br>";
    echo "<strong>Message:</strong> " . $msg['message'] . "<br><br>";

    echo "
    <form method='POST' action='send_message.php'>
        <input type='hidden' name='receiver_id' value='".$msg['sender_id']."'>
        <input name='message' placeholder='Reply...'>
        <button>Send</button>
    </form>
    <form method='POST' action='handle_request.php'>
    <input type='hidden' name='student_id' value='".$msg['sender_id']."'>
    <button name='accept'>Accept</button>
    <button name='reject'>Reject</button>
</form>
    ";

    echo "</div>";
}
?>