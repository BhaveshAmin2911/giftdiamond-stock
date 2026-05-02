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
   Product Info
========================= */

$productQuery = "
SELECT 
p.id,
p.sku,
p.production_run,
p.note,
p.urgent,
p.urgent_time,
p.image,
p.status,
p.current_stage,
p.current_karigar_id,
p.net_weight,
p.gross_weight,
cb.name as casting_box_id,
fb.name as final_box_id

FROM products p

LEFT JOIN work_types wt
ON p.current_stage = wt.id

LEFT JOIN karigars k
ON p.current_karigar_id = k.id

LEFT JOIN boxes cb
ON p.casting_box_id = cb.id

LEFT JOIN boxes fb
ON p.final_box_id = fb.id

WHERE p.id = ?
";

$stmt = $conn->prepare($productQuery);
$stmt->bind_param("i",$product_id);
$stmt->execute();

$product = $stmt->get_result()->fetch_assoc();

if(!$product){
    echo json_encode([
        "status"=>false,
        "message"=>"Product not found"
    ]);
    exit;
}


/* =========================
   PRODUCT QUANTITY
========================= */

$q = $conn->prepare("
SELECT 
casting_quantity,
process_quantity,
ready_quantity,
sold_quantity,
total_quantity
FROM product_quantities
WHERE product_id = ?
");

$q->bind_param("i",$product_id);
$q->execute();

$quantities = $q->get_result()->fetch_assoc();


/* =========================
   Product Setting Quantities
========================= */

$settingsQuery = "
SELECT 
st.id,
st.name,
IFNULL(psq.quantity,0) AS quantity

FROM setting_types st

LEFT JOIN product_setting_quantities psq
ON st.id = psq.setting_type_id
AND psq.product_id = ?

ORDER BY st.id
";

$stmt = $conn->prepare($settingsQuery);
$stmt->bind_param("i",$product_id);
$stmt->execute();

$result = $stmt->get_result();

$settings = [];

while($row = $result->fetch_assoc()){
    $settings[] = $row;
}


/* =========================
   Work History
========================= */

$historyQuery = "
SELECT 
h.id,
wt.work_name AS work_type,
st.name AS setting_type,
k.name AS karigar,
h.weight,
h.rate,
h.amount,
h.created_by

FROM product_work_history h

LEFT JOIN work_types wt
ON h.work_type_id = wt.id

LEFT JOIN setting_types st
ON h.setting_type_id = st.id

LEFT JOIN karigars k
ON h.karigar_id = k.id

WHERE h.product_id = ?

ORDER BY h.id ASC
";

$stmt = $conn->prepare($historyQuery);
$stmt->bind_param("i",$product_id);
$stmt->execute();

$result = $stmt->get_result();

$history = [];

$total_labour = 0;

while($row = $result->fetch_assoc()){
    $history[] = $row;
    $total_labour += $row['amount'];
}


/* =========================
   EXTRA COSTS
========================= */

$extraQuery = "
SELECT id, amount, description, created_at
FROM product_extra_costs
WHERE product_id = ?
ORDER BY id DESC
";

$stmt = $conn->prepare($extraQuery);
$stmt->bind_param("i",$product_id);
$stmt->execute();

$result = $stmt->get_result();

$extra_costs = [];
$total_extra_cost = 0;

while($row = $result->fetch_assoc()){
    $extra_costs[] = $row;
    $total_extra_cost += $row['amount'];
}


/* =========================
   FINAL LABOUR
========================= */

$total_labour_all = $total_labour + $total_extra_cost;


/* =========================
   APPLY CALCULATIONS
========================= */

$product['making_cost'] = $total_labour;
$product['extra_cost'] = $total_extra_cost;
$product['total_labour'] = $total_labour_all;

$product['net_weight_with_margin'] =
$product['net_weight'] * $net_margin;

$product['total_labour_with_margin'] =
$total_labour_all * $labour_margin;


/* =========================
   GET ALL PRODUCTION RUNS
========================= */

$sku = $product['sku'];

$q = $conn->prepare("
SELECT 
p.id,
p.production_run,
q.casting_quantity,
q.process_quantity,
q.ready_quantity,
q.sold_quantity,
q.total_quantity
FROM products p
LEFT JOIN product_quantities q
ON p.id = q.product_id
WHERE p.sku = ?
ORDER BY p.production_run ASC
");

$q->bind_param("s",$sku);
$q->execute();

$result = $q->get_result();

$runs = [];

while($row = $result->fetch_assoc()){
    $runs[] = $row;
}


/* =========================
   IMAGE URL
========================= */

$base_url = "https://app.dajdiamond.com/";

if(!empty($product['image'])){
    $product['image'] = $base_url . $product['image'];
}


/* =========================
   RESPONSE
========================= */

echo json_encode([
    "status"=>true,
    "product"=>$product,
    "quantities"=>$quantities,
    "settings"=>$settings,
    "work_history"=>$history,
    "extra_costs"=>$extra_costs,
    "runs"=>$runs
]);