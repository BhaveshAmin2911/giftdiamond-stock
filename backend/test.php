<?php
require_once("config/db.php");

echo json_encode([
    "status" => true,
    "message" => "API working"
]);