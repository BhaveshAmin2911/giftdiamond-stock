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
$note = $_POST['note'] ?? '';

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
        note = ?
        WHERE id = ?
    ");

    $stmt->bind_param("si", $note, $product_id); 
    $stmt->execute();

/* =========================
   RESPONSE
========================= */

echo json_encode([
    "status"=>true,
    "message"=>"Note updated successfully"
]);