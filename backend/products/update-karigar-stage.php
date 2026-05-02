<?php

require_once("../config/db.php");
require_once("../utils/auth.php");

$user_id = authenticate();

/* =========================
   INPUT
========================= */

$product_id = $_POST['product_id'] ?? 0;
$current_stage = $_POST['current_stage'] ?? null;
$current_karigar_id = $_POST['current_karigar_id'] ?? null;

if(!$product_id){
    echo json_encode([
        "status"=>false,
        "message"=>"Product ID required"
    ]);
    exit;
}

/* =========================
   VALIDATE KARIGAR
========================= */

$karigar_name = null;

if(!empty($current_karigar_id)){
    $check = $conn->prepare("
    SELECT name FROM karigars WHERE id = ?
    ");
    $check->bind_param("i",$current_karigar_id);
    $check->execute();

    $karigar = $check->get_result()->fetch_assoc();

    if(!$karigar){
        echo json_encode([
            "status"=>false,
            "message"=>"Invalid karigar"
        ]);
        exit;
    }

    $karigar_name = $karigar['name'];
}

/* =========================
   UPDATE PRODUCT
========================= */

$stmt = $conn->prepare("
UPDATE products
SET 
current_stage = ?,
current_karigar_id = ?,
updated_at = NOW()
WHERE id = ?
");

$stmt->bind_param(
    "sii",
    $current_stage,
    $current_karigar_id,
    $product_id
);

$stmt->execute();

/* =========================
   RESPONSE
========================= */

echo json_encode([
    "status"=>true,
    "message"=>"Stage and karigar updated successfully",
    "current_stage"=>$current_stage,
    "karigar_id"=>$current_karigar_id,
    "karigar_name"=>$karigar_name
]);