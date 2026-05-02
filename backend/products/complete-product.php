<?php

// ini_set('display_errors', 1);
// ini_set('display_startup_errors', 1);
// error_reporting(E_ALL);

require_once("../config/db.php");
require_once("../utils/auth.php");

$user_id = authenticate();

/* =========================
   Get request data
========================= */

$product_id  = $_POST['product_id'] ?? 0;
$extra_cost  = $_POST['extra_cost'] ?? 0;
$description = $_POST['description'] ?? '';
$quantity    = 1;
$color_id    = $_POST['color_id'] ?? 0;

/* BOX INPUT */
$box_id = $_POST['box_id'] ?? 0;
$new_box = trim($_POST['new_box'] ?? '');
$box_type = $_POST['box_type'] ?? ''; // should be 'final'

if(!$product_id){
    echo json_encode([
        "status"=>false,
        "message"=>"Product ID required"
    ]);
    exit;
}

$conn->begin_transaction();

try{

/* =========================
   Get product info
========================= */

$q = $conn->prepare("
SELECT sku, production_run, image
FROM products
WHERE id = ?
");

$q->bind_param("i",$product_id);
$q->execute();

$product = $q->get_result()->fetch_assoc();

if(!$product){
    throw new Exception("Product not found");
}

$sku = $product['sku'];
$production_run = $product['production_run'];
$old_image = $product['image'] ?? null;


/* =========================
   BOX HANDLING (OPTIONAL)
========================= */

$final_box_id = null;

if(!empty($box_id) || !empty($new_box)){

    if(!empty($box_type) && $box_type != 'final'){
        throw new Exception("Invalid box type");
    }

    /* CREATE NEW BOX */

    if(!empty($new_box)){

        $check = $conn->prepare("
        SELECT id FROM boxes 
        WHERE name = ? AND type = ?
        LIMIT 1
        ");

        $check->bind_param("ss",$new_box,$box_type);
        $check->execute();

        $existing = $check->get_result()->fetch_assoc();

        if($existing){
            $box_id = $existing['id'];
        }else{

            $stmt = $conn->prepare("
            INSERT INTO boxes (name, type)
            VALUES (?,?)
            ");

            $stmt->bind_param("ss",$new_box,$box_type);
            $stmt->execute();

            $box_id = $conn->insert_id;
        }
    }

    /* VALIDATE BOX */

    if(!empty($box_id)){

        $check = $conn->prepare("
        SELECT id FROM boxes 
        WHERE id = ? AND type = 'final'
        ");

        $check->bind_param("i",$box_id);
        $check->execute();

        if(!$check->get_result()->fetch_assoc()){
            throw new Exception("Invalid final box");
        }

        $final_box_id = $box_id;
    }
}


/* =========================
   Upload New Image
========================= */

$image_path = $old_image;

if(isset($_FILES['image']) && $_FILES['image']['error'] == 0){

    $file = $_FILES['image'];
    $filename = time() . "_" . basename($file['name']);

    $uploadDir = __DIR__ . "/../../uploads/";

    if(!is_dir($uploadDir)){
        mkdir($uploadDir, 0777, true);
    }

    $target = $uploadDir . $filename;

    if(move_uploaded_file($file['tmp_name'], $target)){
        $image_path = "uploads/" . $filename;
    }else{
        throw new Exception("Image upload failed");
    }
}


/* =========================
   Insert Extra Cost
========================= */

if($extra_cost > 0){

    $stmt = $conn->prepare("
    INSERT INTO product_extra_costs
    (product_id, amount, description, created_by)
    VALUES (?,?,?,?)
    ");

    $stmt->bind_param(
        "idsi",
        $product_id,
        $extra_cost,
        $description,
        $user_id
    );

    $stmt->execute();
}


/* =========================
  MOVE QUANTITY (PROCESS → READY)
========================= */

if($quantity > 0){

    // if(!$color_id){
    //     throw new Exception("Color is required");
    // }

    $check = $conn->prepare("
        SELECT process_quantity
        FROM product_quantities
        WHERE product_id = ?
    ");

    $check->bind_param("i",$product_id);
    $check->execute();

    $stock = $check->get_result()->fetch_assoc();

    if(!$stock || $stock['process_quantity'] < $quantity){
        throw new Exception("Not enough items in process stage");
    }

    $q = $conn->prepare("
    UPDATE product_quantities
    SET
    process_quantity = process_quantity - ?,
    ready_quantity = ready_quantity + ?
    WHERE product_id = ?
    ");

    $q->bind_param("iii",$quantity,$quantity,$product_id);
    $q->execute();


    // /* COLOR QUANTITY */

    // $stmt = $conn->prepare("
    // INSERT INTO product_color_quantities
    // (product_id, color_id, quantity)
    // VALUES (?,?,?)
    // ON DUPLICATE KEY UPDATE
    // quantity = quantity + VALUES(quantity)
    // ");

    // $stmt->bind_param("iii",$product_id,$color_id,$quantity);
    // $stmt->execute();


    /* MASTER UPDATE */

    // if($production_run != 1){

    //     $q = $conn->prepare("
    //     SELECT id
    //     FROM products
    //     WHERE sku = ?
    //     AND production_run = 1
    //     LIMIT 1
    //     ");

    //     $q->bind_param("s",$sku);
    //     $q->execute();

    //     $master = $q->get_result()->fetch_assoc();

    //     if($master){

    //         $master_id = $master['id'];

    //         $q = $conn->prepare("
    //         UPDATE product_quantities
    //         SET
    //         process_quantity = process_quantity - ?,
    //         ready_quantity = ready_quantity + ?
    //         WHERE product_id = ?
    //         ");

    //         $q->bind_param("iii",$quantity,$quantity,$master_id);
    //         $q->execute();

    //         $stmt = $conn->prepare("
    //         INSERT INTO product_color_quantities
    //         (product_id, color_id, quantity)
    //         VALUES (?,?,?)
    //         ON DUPLICATE KEY UPDATE
    //         quantity = quantity + VALUES(quantity)
    //         ");

    //         $stmt->bind_param("iii",$master_id,$color_id,$quantity);
    //         $stmt->execute();
    //     }
    // }
}


/* =========================
  ADD LARIYA PIN
========================= */

$lariya_pin_weight = $_POST['lariya_pin_weight'] ?? 0;

if($lariya_pin_weight > 0){

    $lariya_rate = 80;
    $lariya_amount = $lariya_pin_weight * $lariya_rate;

    $stmt = $conn->prepare("
    UPDATE products
    SET
    lariya_pin = ?,
    net_weight = net_weight + ?,
    gross_weight = gross_weight + ?
    WHERE id = ?
    ");

    $stmt->bind_param(
        "dddi",
        $lariya_pin_weight,
        $lariya_pin_weight,
        $lariya_pin_weight,
        $product_id
    );

    $stmt->execute();

    $work_type_id = 2;
    $setting_type_id = 14;
    $null_karigar = 0;

    $stmt = $conn->prepare("
    INSERT INTO product_work_history
    (product_id, work_type_id, setting_type_id, karigar_id, weight, rate, amount)
    VALUES
    (?,?,?,?,?,?,?)
    ");

    $stmt->bind_param(
        "iiiiddd",
        $product_id,
        $work_type_id,
        $setting_type_id,
        $null_karigar,
        $lariya_pin_weight,
        $lariya_rate,
        $lariya_amount
    );

    $stmt->execute();
}


/* =========================
   UPDATE IMAGE FOR ALL SAME SKU
========================= */

$stmt = $conn->prepare("
UPDATE products
SET image = ?
WHERE sku = ?
");

$stmt->bind_param("ss",$image_path,$sku);
$stmt->execute();


/* =========================
   Update Product Status (OPTIONAL BOX)
========================= */

if($final_box_id !== null){

    $stmt = $conn->prepare("
    UPDATE products
    SET 
    status = 'completed',
    current_stage = 4,
    final_box_id = ?,
    updated_at = NOW()
    WHERE id = ?
    ");

    $stmt->bind_param("ii",$final_box_id,$product_id);

}else{

    $stmt = $conn->prepare("
    UPDATE products
    SET 
    status = 'completed',
    current_stage = 4,
    updated_at = NOW()
    WHERE id = ?
    ");

    $stmt->bind_param("i",$product_id);
}

$stmt->execute();


$conn->commit();


/* =========================
   SAFE DELETE OLD IMAGE
========================= */

if($old_image && $old_image != $image_path){

    $check = $conn->prepare("
    SELECT COUNT(*) as total
    FROM products
    WHERE image = ?
    ");

    $check->bind_param("s", $old_image);
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
    "message"=>"Product completed successfully"
]);

}catch(Exception $e){

$conn->rollback();

echo json_encode([
    "status"=>false,
    "message"=>$e->getMessage()
]);

}