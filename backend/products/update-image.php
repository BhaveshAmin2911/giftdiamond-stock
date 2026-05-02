<?php

require_once("../config/db.php");
require_once("../utils/auth.php");

$user_id = authenticate();

$product_id = $_POST['product_id'] ?? 0;

if(!$product_id){
    echo json_encode([
        "status"=>false,
        "message"=>"Product ID required"
    ]);
    exit;
}

/* =========================
   GET OLD IMAGE
========================= */

$q = $conn->prepare("
SELECT image
FROM products
WHERE id = ?
");

$q->bind_param("i",$product_id);
$q->execute();

$product = $q->get_result()->fetch_assoc();

if(!$product){
    echo json_encode([
        "status"=>false,
        "message"=>"Product not found"
    ]);
    exit;
}

$old_image = $product['image'] ?? null;

/* =========================
   UPLOAD NEW IMAGE
========================= */

if(!isset($_FILES['image']) || $_FILES['image']['error'] != 0){
    echo json_encode([
        "status"=>false,
        "message"=>"Image required"
    ]);
    exit;
}

$file = $_FILES['image'];
$filename = time() . "_" . basename($file['name']);

$uploadDir = __DIR__ . "/../../uploads/";

if(!is_dir($uploadDir)){
    mkdir($uploadDir, 0777, true);
}

$target = $uploadDir . $filename;

if(!move_uploaded_file($file['tmp_name'], $target)){
    echo json_encode([
        "status"=>false,
        "message"=>"Upload failed"
    ]);
    exit;
}
$base_url = "https://app.dajdiamond.com/";
$image_path = "uploads/" . $filename;

/* =========================
   UPDATE DB
========================= */

$stmt = $conn->prepare("
UPDATE products
SET image = ?, updated_at = NOW()
WHERE id = ?
");

$stmt->bind_param("si",$image_path,$product_id);
$stmt->execute();

/* =========================
   DELETE OLD IMAGE (SAFE)
========================= */

if($old_image && $old_image != $image_path){

    $check = $conn->prepare("
    SELECT COUNT(*) as total
    FROM products
    WHERE image = ?
    ");

    $check->bind_param("s",$old_image);
    $check->execute();

    $count = $check->get_result()->fetch_assoc()['total'];

    if($count == 0){
        $old_path = __DIR__ . "/../../" . $old_image;

        if(file_exists($old_path)){
            unlink($old_path);
        }
    }
}

/* =========================
   RESPONSE
========================= */

echo json_encode([
    "status"=>true,
    "message"=>"Image updated successfully",
    "image"=>$base_url . $image_path
]);