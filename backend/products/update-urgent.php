<?php

// ini_set('display_errors', 1);
// ini_set('display_startup_errors', 1);
// error_reporting(E_ALL);

require_once("../config/db.php");
require_once("../utils/auth.php");

$user_id = authenticate();

/* =========================
   INPUT
========================= */

$product_id = $_POST['product_id'] ?? 0;
$urgent = filter_var($_POST['urgent'] ?? false, FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
$urgent_time = null;

if (!empty($_POST['urgent_time'])) {
    $urgent_time = date('Y-m-d H:i:s', strtotime($_POST['urgent_time']));
}

if(!$product_id){
    echo json_encode([
        "status"=>false,
        "message"=>"Product ID required"
    ]);
    exit;
}

/* =========================
   UPDATE PRODUCT
========================= */
    
$stmt = $conn->prepare("
        UPDATE products
        SET 
        urgent = ?,
        urgent_time = ?
        WHERE id = ?
    ");

    $stmt->bind_param("isi", $urgent, $urgent_time, $product_id); 
    $stmt->execute();

/* =========================
   RESPONSE
========================= */

echo json_encode([
    "status"=>true,
    "message"=>"Note updated successfully"
]);