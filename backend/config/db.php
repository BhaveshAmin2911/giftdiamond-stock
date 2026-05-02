<?php

/* CORS HEADERS */
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

/* Handle Preflight OPTIONS Request */
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host = "localhost";  // On Hostinger this is usually localhost
$dbname = "u842522106_silver_stock";
$username = "u842522106_silver_stock";
$password = "Bh@vesh2911";

$conn = new mysqli($host, $username, $password, $dbname);

date_default_timezone_set('Asia/Kolkata');

$conn->query("SET time_zone = '+05:30'");

if ($conn->connect_error) {
    die(json_encode([
        "status" => false,
        "message" => "Database connection failed"
    ]));
}
?>