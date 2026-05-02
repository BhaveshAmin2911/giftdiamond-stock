<?php

// ini_set('display_errors', 1);
// ini_set('display_startup_errors', 1);
// error_reporting(E_ALL);

require_once("../config/db.php");
require_once("../utils/auth.php");

authenticate();

$result = $conn->query("
    SELECT id, name, phone, address
    FROM customers
    ORDER BY name ASC
");

$data = [];

while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode([
    "status" => true,
    "data" => $data
]);