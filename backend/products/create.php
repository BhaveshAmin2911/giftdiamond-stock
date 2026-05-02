<?php

// ini_set('display_errors', 1);
// ini_set('display_startup_errors', 1);
// error_reporting(E_ALL);

require_once("../config/db.php");
require_once("../utils/auth.php");

$user_id = authenticate();

/* =========================
   Get form values
========================= */

$sku = $_POST['sku'] ?? '';
$status = $_POST['status'] ?? 'in_progress'; // stage id
$customer_name = $_POST['customer_name'] ?? null;
$note = $_POST['note'] ?? null;
$urgent = filter_var($_POST['urgent'] ?? false, FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
$urgent_time = null;

if (!empty($_POST['urgent_time'])) {
    $urgent_time = date('Y-m-d H:i:s', strtotime($_POST['urgent_time']));
}

$ad = $_POST['AD'] ?? 0;
$pearl = $_POST['pearl'] ?? 0;
$polki_a = $_POST['polki-A'] ?? 0;
$polki_b = $_POST['polki-B'] ?? 0;
$stone = $_POST['stone'] ?? 0;
$takkar = $_POST['takkar'] ?? 0;

$current_karigar_id = $_POST['current_karigar_id'] ?? null;


/* =========================
   Validation
========================= */

if(!$sku){
    echo json_encode([
        "status"=>false,
        "message"=>"SKU required"
    ]);
    exit;
}

$checkSku = $conn->prepare("
SELECT id 
FROM products 
WHERE sku = ?
LIMIT 1
");

$checkSku->bind_param("s", $sku);
$checkSku->execute();

$existingSku = $checkSku->get_result()->fetch_assoc();

if($existingSku){
    echo json_encode([
        "status"=>false,
        "message"=>"Product with this SKU already exists"
    ]);
    exit;
}


/* =========================
   Find next production run
========================= */

$runQuery = $conn->prepare("
SELECT IFNULL(MAX(production_run),0)+1 AS next_run
FROM products
WHERE sku = ?
");

$runQuery->bind_param("s",$sku);
$runQuery->execute();

$runResult = $runQuery->get_result()->fetch_assoc();
$production_run = $runResult['next_run'];


/* =========================
   Image Upload
========================= */

$image_path = null;

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
    } else {

        echo json_encode([
            "status"=>false,
            "message"=>"Image upload failed"
        ]);
        exit;
    }
}


/* =========================
   Insert Product
========================= */

$stmt = $conn->prepare("
INSERT INTO products
(
sku,
current_stage,
production_run,
customer_name,
image,
current_karigar_id,
note,
urgent,
urgent_time,
status,
category_id,
created_by
)
VALUES
(?,?,?,?,?,?,?,?,?,'in_progress',?,?)
");

$stmt->bind_param(
"sisssssisii",
$sku,
$status,
$production_run,
$customer_name,
$image_path,
$current_karigar_id,
$note,
$urgent,
$urgent_time,
$category,
$user_id
);

$stmt->execute();

$product_id = $conn->insert_id;


/* =========================
   Create Quantity Row
========================= */

$q = $conn->prepare("
INSERT INTO product_quantities
(product_id)
VALUES (?)
");

$q->bind_param("i",$product_id);
$q->execute();


/* =========================
   Insert Setting Quantities
========================= */

$settings = [
    1 => $ad,
    2 => $pearl,
    3 => $polki_a,
    4 => $polki_b,
    5 => $stone,
    6 => $takkar
];

foreach($settings as $setting_type_id => $quantity){

    if($quantity > 0){

        $stmt = $conn->prepare("
        INSERT INTO product_setting_quantities
        (product_id, setting_type_id, quantity)
        VALUES (?,?,?)
        ");

        $stmt->bind_param(
            "iii",
            $product_id,
            $setting_type_id,
            $quantity
        );

        $stmt->execute();
    }
}


/* =========================
   Response
========================= */

echo json_encode([
    "status"=>true,
    "message"=>"Product created successfully",
    "product_id"=>$product_id,
    "production_run"=>$production_run
]);