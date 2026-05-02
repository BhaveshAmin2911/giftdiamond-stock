<?php

require_once "../config/db.php";
require_once "../utils/auth.php";

$user_id = authenticate();

/* =========================
   GET FILTER INPUT
========================= */

$search = $_POST["search"] ?? "";
$karigar_id = $_POST["karigar_id"] ?? "";
$current_stage = $_POST["current_stage"] ?? "";
$production_run = $_POST["production_run"] ?? "";
$category_id = $_POST["category_id"] ?? "";
$status = $_POST["status"] ?? "";
$order = $_POST["p_order"] ?? "";
$box_id = $_POST["box_id"] ?? "";
$quantity_status = $_POST["quantity_status"] ?? "";

$per_page = $_POST["per_page"] ?? 20;
$current_page = $_POST["current_page"] ?? 1;

$offset = ($current_page - 1) * $per_page;

/* =========================
   LOAD MARGINS
========================= */

$margins = [];

$q = $conn->query("SELECT type,multiplier FROM margins");

while ($row = $q->fetch_assoc()) {
    $margins[$row["type"]] = $row["multiplier"];
}

$net_margin = $margins["net_weight"] ?? 1;
$labour_margin = $margins["labour"] ?? 1;

/* =========================
   BUILD WHERE CONDITIONS
========================= */

$where = [];
$params = [];
$types = "";

/* SEARCH */

if (!empty($search)) {
    $where[] = "(
        p.sku LIKE ? 
        OR p.customer_name LIKE ?
        OR cb.name LIKE ?
        OR fb.name LIKE ?
    )";

    $search_value = "%" . $search . "%";

    $params[] = $search_value;
    $params[] = $search_value;
    $params[] = $search_value;
    $params[] = $search_value;

    $types .= "ssss";
}

/* KARIGAR */

if (!empty($karigar_id)) {
    $where[] = "p.current_karigar_id = ?";
    $params[] = $karigar_id;
    $types .= "i";
}

/* PRODUCTION RUN */

if (!empty($production_run)) {
    $where[] = "p.production_run = ?";
    $params[] = $production_run;
    $types .= "i";
}

/* CATEGORY */

if (!empty($category_id)) {
    $where[] = "p.category_id = ?";
    $params[] = $category_id;
    $types .= "s";
}

/* STAGE */

if (!empty($current_stage)) {
    $where[] = "p.current_stage = ?";
    $params[] = $current_stage;
    $types .= "s";
}

/* STATUS */

if (!empty($status)) {
    $where[] = "p.status = ?";
    $params[] = $status;
    $types .= "s";
}

/* BOX FILTER */

if (!empty($box_id)) {
    $where[] = "(p.casting_box_id = ? OR p.final_box_id = ?)";
    $params[] = $box_id;
    $params[] = $box_id;
    $types .= "ii";
}

/* =========================
   QUANTITY STATUS FILTER
========================= */

if (!empty($quantity_status)) {

    if ($quantity_status == "casting") {
        $where[] = "EXISTS (
            SELECT 1 FROM product_quantities pq
            WHERE pq.product_id = p.id
            AND pq.casting_quantity > 0
        )";
    }

    if ($quantity_status == "process") {
        $where[] = "EXISTS (
            SELECT 1 FROM product_quantities pq
            WHERE pq.product_id = p.id
            AND pq.process_quantity > 0
        )";
    }

    if ($quantity_status == "ready") {
        $where[] = "EXISTS (
            SELECT 1 FROM product_quantities pq
            WHERE pq.product_id = p.id
            AND pq.ready_quantity > 0
        )";
    }

    if ($quantity_status == "sold") {
        $where[] = "EXISTS (
            SELECT 1 FROM product_quantities pq
            WHERE pq.product_id = p.id
            AND pq.sold_quantity > 0
        )";
    }
}

/* WHERE SQL */

$where_sql = "";

if (count($where) > 0) {
    $where_sql = "WHERE " . implode(" AND ", $where);
}

if (!empty($order) && $order == "time") {
    $order_sql = "ORDER BY p.created_at ASC, p.id DESC";
} else {
    $order_sql = "ORDER BY p.id DESC, p.created_at DESC";
}

/* =========================
   PRODUCT LIST QUERY
========================= */

$query = "
SELECT 
    p.id,
    p.sku,
    p.production_run,
    p.customer_name,
    p.image,
    p.status,
    p.current_stage,
    p.category_id,
    p.current_karigar_id,
    p.updated_at,
    p.net_weight,
    p.gross_weight,

    cb.name AS casting_box_name,
    fb.name AS final_box_name,

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

LEFT JOIN boxes cb 
ON p.casting_box_id = cb.id

LEFT JOIN boxes fb 
ON p.final_box_id = fb.id

$where_sql
$order_sql
LIMIT ?, ?
";

$stmt = $conn->prepare($query);

/* =========================
   BIND PARAMETERS
========================= */

$params[] = $offset;
$params[] = $per_page;
$types .= "ii";

$stmt->bind_param($types, ...$params);

$stmt->execute();

$result = $stmt->get_result();

$products = [];

$base_url = "https://app.dajdiamond.com/";

while ($row = $result->fetch_assoc()) {

    if (!empty($row["image"])) {
        $row["image"] = $base_url . $row["image"];
    }

    $row["display_sku"] = $row["sku"] . "-R" . $row["production_run"];

    $row["net_weight_with_margin"] = $row["net_weight"] * $net_margin;

    $total_labour = $row["making_cost"] + $row["extra_cost"];

    $row["total_labour"] = $total_labour;

    $row["total_labour_with_margin"] = $total_labour * $labour_margin;

    $products[] = $row;
}

/* =========================
   RESPONSE
========================= */

echo json_encode([
    "status" => true,
    "message" => "Product list fetched",
    "data" => $products,
]);