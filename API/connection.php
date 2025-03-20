<?php
$servername = "localhost";  // Hostname, usually localhost for Hostinger
$username = "u843230181_bato_norlitz";  // Your MySQL username
$password = "?dA68JdG";  // Your MySQL password
$dbname = "u843230181_bato_norlitz";  // Your database name

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
