<?php

require_once("../config/db.php");
require_once("../utils/auth.php");

$user_id = authenticate();

$product_id = $_POST['product_id'] ?? 0;
$type = $_POST['type'] ?? ''; // casting / final
$box_id = $_POST['box_id'] ?? 0;
$new_box = trim($_POST['new_box'] ?? '');

if(!$product_id || !$type){
    echo json_encode([
        "status"=>false,
        "message"=>"Product ID and type required"
    ]);
    exit;
}

if($type != 'casting' && $type != 'final'){
    echo json_encode([
        "status"=>false,
        "message"=>"Invalid box type"
    ]);
    exit;
}

/* =========================
   CREATE NEW BOX
========================= */

if(!empty($new_box)){

    $check = $conn->prepare("
    SELECT id FROM boxes 
    WHERE name = ? AND type = ?
    LIMIT 1
    ");

    $check->bind_param("ss",$new_box,$type);
    $check->execute();

    $existing = $check->get_result()->fetch_assoc();

    if($existing){
        $box_id = $existing['id'];
    }else{

        $stmt = $conn->prepare("
        INSERT INTO boxes (name, type)
        VALUES (?,?)
        ");

        $stmt->bind_param("ss",$new_box,$type);
        $stmt->execute();

        $box_id = $conn->insert_id;
    }
}

/* =========================
   VALIDATE BOX
========================= */

if(!$box_id){
    echo json_encode([
        "status"=>false,
        "message"=>"Box required"
    ]);
    exit;
}

$check = $conn->prepare("
SELECT id FROM boxes 
WHERE id = ? AND type = ?
");

$check->bind_param("is",$box_id,$type);
$check->execute();

if(!$check->get_result()->fetch_assoc()){
    echo json_encode([
        "status"=>false,
        "message"=>"Invalid box"
    ]);
    exit;
}

/* =========================
   UPDATE PRODUCT
========================= */

if($type == 'casting'){
    $stmt = $conn->prepare("
    UPDATE products
    SET casting_box_id = ?, updated_at = NOW()
    WHERE id = ?
    ");
} else {
    $stmt = $conn->prepare("
    UPDATE products
    SET final_box_id = ?, updated_at = NOW()
    WHERE id = ?
    ");
}

$stmt->bind_param("ii",$box_id,$product_id);
$stmt->execute();

/* =========================
   GET BOX NAME
========================= */

$getBox = $conn->prepare("
SELECT name FROM boxes WHERE id = ?
");

$getBox->bind_param("i",$box_id);
$getBox->execute();

$boxData = $getBox->get_result()->fetch_assoc();

$box_name = $boxData['name'] ?? '';

/* =========================
   RESPONSE
========================= */

echo json_encode([
    "status"=>true,
    "message"=>"Box updated successfully",
    "box_id"=>$box_id,
    "box_name"=>$box_name
]);