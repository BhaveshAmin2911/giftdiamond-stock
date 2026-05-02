<?php

require_once("../config/db.php");
require_once("../utils/auth.php");

$user_id = authenticate();

$product_id      = $_POST['product_id'] ?? 0;
$quantity        = intval($_POST['quantity'] ?? 0);
$customer_name   = $_POST['customer_name'] ?? null;
$current_karigar = $_POST['current_karigar'] ?? null;

if(!$product_id || $quantity <= 0){
    echo json_encode([
        "status"=>false,
        "message"=>"product_id and quantity required"
    ]);
    exit;
}

$conn->begin_transaction();

try{

/* =========================
   LOAD MASTER PRODUCT
========================= */

$q = $conn->prepare("
SELECT id, sku, image, net_weight, casting_box_id, category_id
FROM products
WHERE id = ?
LIMIT 1
");

$q->bind_param("i",$product_id);
$q->execute();

$master = $q->get_result()->fetch_assoc();

if(!$master){
    throw new Exception("Master product not found");
}

$sku = $master['sku'];
$net_weight = $master['net_weight'];
$casting_box = $master['casting_box_id'];
$category_id = $master['category_id'];

/* =========================
   GET ORIGINAL CASTING KARIGAR
========================= */

$q = $conn->prepare("
SELECT karigar_id
FROM product_work_history
WHERE product_id = ?
AND work_type_id = 1
ORDER BY id DESC
LIMIT 1
");

$q->bind_param("i",$product_id);
$q->execute();

$castingData = $q->get_result()->fetch_assoc();
$casting_karigar = $castingData['karigar_id'] ?? null;


/* =========================
   GET CASTING RATE
========================= */

$rate = 0;

if($casting_karigar){

    $q = $conn->prepare("
    SELECT rate
    FROM karigar_work_rates
    WHERE karigar_id = ?
    AND work_type_id = 1
    LIMIT 1
    ");

    $q->bind_param("i",$casting_karigar);
    $q->execute();

    $rateData = $q->get_result()->fetch_assoc();
    $rate = $rateData['rate'] ?? 0;
}


/* =========================
   CHECK CASTING STOCK
========================= */

$q = $conn->prepare("
SELECT casting_quantity
FROM product_quantities
WHERE product_id = ?
");

$q->bind_param("i",$product_id);
$q->execute();

$qtyData = $q->get_result()->fetch_assoc();

if(!$qtyData || $qtyData['casting_quantity'] < $quantity){
    throw new Exception("Not enough casting pieces available");
}


/* =========================
   GET LAST PRODUCTION RUN
========================= */

$q = $conn->prepare("
SELECT IFNULL(MAX(production_run),1) AS last_run
FROM products
WHERE sku = ?
");

$q->bind_param("s",$sku);
$q->execute();

$runData = $q->get_result()->fetch_assoc();
$last_run = $runData['last_run'];


/* =========================
   CREATE PRODUCTS (1 per piece)
========================= */

for($i=1; $i <= $quantity; $i++){

    $last_run++;

    /* create product */

    $stmt = $conn->prepare("
    INSERT INTO products
    (
    sku,
    production_run,
    customer_name,
    image,
    net_weight,
    casting_box_id,
    category_id,
    current_karigar_id,
    current_stage,
    status,
    created_by
    )
    VALUES
    (?,?,?,?,?,?,?,?,2,'in_progress',?)
    ");

    $stmt->bind_param(
    "sssssssii",
    $sku,
    $last_run,
    $customer_name,
    $master['image'],
    $net_weight,
    $casting_box,
    $category_id,
    $current_karigar,
    $user_id
    );

    $stmt->execute();

    $new_product_id = $conn->insert_id;


    /* copy setting quantities */

    $stmt = $conn->prepare("
    INSERT INTO product_setting_quantities
    (product_id, setting_type_id, quantity)

    SELECT ?, setting_type_id, quantity
    FROM product_setting_quantities
    WHERE product_id = ?
    ");

    $stmt->bind_param("ii",$new_product_id,$product_id);
    $stmt->execute();


    /* insert casting history */

    $amount = $net_weight * $rate;

    $stmt = $conn->prepare("
    INSERT INTO product_work_history
    (product_id, work_type_id, karigar_id, weight, rate, amount)
    VALUES
    (?,?,?,?,?,?)
    ");

    $work_type_id = 1;

    $stmt->bind_param(
    "iiiddd",
    $new_product_id,
    $work_type_id,
    $casting_karigar,
    $net_weight,
    $rate,
    $amount
    );

    $stmt->execute();


    /* create quantity row */

    $stmt = $conn->prepare("
    INSERT INTO product_quantities
    (product_id, casting_quantity, process_quantity, ready_quantity, total_quantity)
    VALUES
    (?,0,1,0,1)
    ");

    $stmt->bind_param("i",$new_product_id);
    $stmt->execute();
}


/* =========================
   UPDATE MASTER QUANTITY
========================= */

$stmt = $conn->prepare("
UPDATE product_quantities
SET
casting_quantity = casting_quantity - ?,
process_quantity = process_quantity + ?
WHERE product_id = ?
");

$stmt->bind_param(
"iii",
$quantity,
$quantity,
$product_id
);

$stmt->execute();


$conn->commit();

echo json_encode([
    "status"=>true,
    "message"=>"Production started successfully"
]);

}catch(Exception $e){

$conn->rollback();

echo json_encode([
    "status"=>false,
    "message"=>$e->getMessage()
]);

}