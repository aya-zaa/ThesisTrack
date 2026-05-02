<?php
include "Connect.php";

$res = mysqli_query($conn,
"SELECT * FROM users WHERE role='professor'");

while ($p = mysqli_fetch_assoc($res)) {

    echo "<div>";

    echo $p['name'] . "<br>";

    echo "
    <form method='POST' action='send_message.php'>
        <input type='hidden' name='receiver_id' value='".$p['id']."'>
        <input name='message' value='I want you as my supervisor'>
        <button>Send Request</button>
    </form>
    ";

    echo "</div><br>";
}
?>