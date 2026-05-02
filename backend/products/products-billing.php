<?php

// ini_set('display_errors', 1);
// ini_set('display_startup_errors', 1);
// error_reporting(E_ALL);

require_once("../config/db.php");
require_once("../utils/auth.php");

$user_id = authenticate();

$product_ids = $_POST['product_ids'] ?? [];

if(empty($product_ids)){
    echo json_encode([
        "status" => false,
        "message" => "Product IDs required"
    ]);
    exit;
}

$product_ids = json_decode($product_ids);

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
   PREPARE IDS
========================= */

$ids = implode(",", array_map('intval',$product_ids));

if(empty($ids)){
    echo json_encode([
        "status" => false,
        "message" => "Invalid product IDs"
    ]);
    exit;
}


/* =========================
   FETCH SETTINGS (ALL PRODUCTS)
========================= */

$settingsData = [];

$settingQuery = "
SELECT product_id, setting_type_id, quantity
FROM product_setting_quantities
WHERE product_id IN ($ids)
";

$settingResult = $conn->query($settingQuery);

while($row = $settingResult->fetch_assoc()){
    $settingsData[$row['product_id']][$row['setting_type_id']] = $row['quantity'];
}


/* =========================
   SETTING NAME MAP
========================= */

$settingMap = [
    1 => "AD",
    2 => "pearl",
    3 => "polki_a",
    4 => "polki_b",
    5 => "stone",
    6 => "takkar"
];


/* =========================
   QUERY PRODUCTS
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

WHERE p.id IN ($ids)
";

$result = $conn->query($query);

if(!$result){
    echo json_encode([
        "status" => false,
        "message" => "Query failed"
    ]);
    exit;
}

$products = [];
$found_ids = [];

$base_url = "https://app.dajdiamond.com/";

while($row = $result->fetch_assoc()){

    $found_ids[] = $row['id'];

    /* STATUS CHECK */
    if($row['status'] != "completed"){
        continue;
    }

    /* STOCK CHECK */
    if($row['ready_quantity'] <= 0){
        continue;
    }

    /* IMAGE URL */
    if(!empty($row['image'])){
        $row['image'] = $base_url . $row['image'];
    }

    /* LABOUR */
    $total_labour = $row['making_cost'] + $row['extra_cost'];
    $total_labour_with_margin = $total_labour * $labour_margin;

    /* NET WEIGHT */
    $net_weight_with_margin = $row['net_weight'] * $net_margin;

    /* =========================
       SETTINGS ATTACH
    ========================== */

    $product_settings = [
        "AD"=>0,
        "pearl"=>0,
        "polki_a"=>0,
        "polki_b"=>0,
        "stone"=>0,
        "takkar"=>0
    ];

    if(isset($settingsData[$row['id']])){

        foreach($settingsData[$row['id']] as $setting_id => $qty){

            $name = $settingMap[$setting_id] ?? $setting_id;
            $product_settings[$name] = $qty;
        }
    }

    $products[] = [
        "id"=>$row['id'],
        "sku"=>$row['sku'],
        "net_weight"=>$net_weight_with_margin,
        "gross_weight"=>$row['gross_weight'],
        "total_labour"=>$total_labour_with_margin,
        "image"=>$row['image'],
        "settings"=>$product_settings
    ];
}


/* =========================
   FIND INVALID IDS
========================= */

$invalid_ids = array_values(
    array_diff($product_ids,$found_ids)
);


/* =========================
   RESPONSE
========================= */

echo json_encode([
    "status" => true,
    "products" => $products,
    "invalid_ids" => $invalid_ids
]);