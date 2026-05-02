<?php

require_once("../config/db.php");
require_once("../utils/auth.php");

$user_id = authenticate();

$sku = $_POST['sku'] ?? '';

if(empty($sku)){
    echo json_encode([
        "status" => false,
        "message" => "SKU is required"
    ]);
    exit;
}

/* =========================
   LOAD MARGINS
========================= */

$margins = [];

$q = $conn->query("SELECT type,multiplier FROM margins");

while($row = $q->fetch_assoc()){
    $margins[$row['type']] = $row['multiplier'];
}

$net_margin = $margins['net_weight'] ?? 1;
$labour_margin = $margins['labour'] ?? 1;


/* =========================
   FIND PRODUCT
========================= */

$query = "
SELECT 
    p.id,
    p.sku,
    p.image,
    p.net_weight,
    p.gross_weight,
    p.status,
    pq.ready_quantity,

    IFNULL((
        SELECT SUM(amount)
        FROM product_work_history
        WHERE product_id = p.id
    ),0) AS making_cost,

    IFNULL((
        SELECT SUM(amount)
        FROM product_extra_costs
        WHERE product_id = p.id
    ),0) AS extra_cost

FROM products p

LEFT JOIN product_quantities pq 
ON pq.product_id = p.id

WHERE 
p.sku = ?

LIMIT 1
";

$stmt = $conn->prepare($query);
$stmt->bind_param("s",$sku);
$stmt->execute();

$result = $stmt->get_result();

if($result->num_rows == 0){
    echo json_encode([
        "status" => false,
        "message" => "Product not found"
    ]);
    exit;
}

$product = $result->fetch_assoc();


/* =========================
   IMAGE URL
========================= */

$base_url = "https://app.dajdiamond.com/";

if(!empty($product['image'])){
    $product['image'] = $base_url . $product['image'];
}


/* =========================
   CALCULATE LABOUR
========================= */

$total_labour =
$product['making_cost'] +
$product['extra_cost'];

$total_labour_with_margin =
$total_labour * $labour_margin;


/* =========================
   APPLY WEIGHT MARGIN
========================= */

$net_weight_with_margin =
$product['net_weight'] * $net_margin;


/* =========================
   FINAL RESPONSE
========================= */

echo json_encode([
    "status" => true,
    "message" => "Product ready for billing",
    "data" => [
        "id" => $product['id'],
        "sku" => $product['sku'],
        "net_weight" => $net_weight_with_margin,
        "gross_weight" => $product['gross_weight'],
        "total_labour" => $total_labour_with_margin,
        "image" => $product['image']
    ]
]);