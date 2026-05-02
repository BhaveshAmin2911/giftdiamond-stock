<?php

require_once("../config/db.php");
require_once("../utils/auth.php");

authenticate();

$result = $conn->query("
    SELECT id, name, type
    FROM boxes
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