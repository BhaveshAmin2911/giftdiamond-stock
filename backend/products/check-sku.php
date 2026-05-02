<?php

require_once("../config/db.php");
require_once("../utils/auth.php");

$user_id = authenticate();

$sku = $_POST['sku'] ?? '';

if(!$sku){
    echo json_encode([
        "status"=>false,
        "message"=>"SKU required"
    ]);
    exit;
}


/* =========================
   FIND ORIGINAL PRODUCT
========================= */

$query = "
SELECT 
p.id,
p.sku,
p.production_run,
q.casting_quantity
FROM products p

LEFT JOIN product_quantities q
ON p.id = q.product_id

WHERE p.sku = ?
AND p.production_run = 1
LIMIT 1
";

$stmt = $conn->prepare($query);
$stmt->bind_param("s",$sku);
$stmt->execute();

$result = $stmt->get_result()->fetch_assoc();

if(!$result){
    echo json_encode([
        "status"=>false,
        "message"=>"Original product not found"
    ]);
    exit;
}

/* =========================
   SUCCESS
========================= */

echo json_encode([
    "status"=>true,
    "message"=>"Casting pieces available",
    "product_id"=>$result['id'],
]);