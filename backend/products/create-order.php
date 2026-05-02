<?php

require_once("../config/db.php");
require_once("../utils/auth.php");

$response = [
    "status" => false,
    "message" => ""
];

$post = $_POST;

$customer_id = isset($post['customer_id']) ? intval($post['customer_id']) : 0;
$created_by  = isset($post['created_by']) ? intval($post['created_by']) : null;
$product_ids = isset($post['product_ids']) ? json_decode($post['product_ids'], true) : [];

if(!$customer_id || empty($product_ids)){
    $response["message"] = "Invalid request.";
    echo json_encode($response);
    exit;
}

$conn->begin_transaction();

try {

    // 1️⃣ Create Order
    $stmt = $conn->prepare("INSERT INTO orders (customer_id, created_by) VALUES (?, ?)");
    $stmt->bind_param("ii", $customer_id, $created_by);
    $stmt->execute();

    $order_id = $stmt->insert_id;


    // 2️⃣ Fetch all SKUs in one query
    $placeholders = implode(',', array_fill(0, count($product_ids), '?'));
    $types = str_repeat('i', count($product_ids));

    $sku_query = $conn->prepare("SELECT id, sku FROM products WHERE id IN ($placeholders)");
    $sku_query->bind_param($types, ...$product_ids);
    $sku_query->execute();

    $result = $sku_query->get_result();

    $sku_map = [];

    while($row = $result->fetch_assoc()){
        $sku_map[$row['id']] = $row['sku'];
    }


    // 3️⃣ Prepare reusable queries
    $stmt_item = $conn->prepare("
        INSERT INTO order_items (order_id, product_id, sku, quantity)
        VALUES (?, ?, ?, 1)
    ");

    $update_stock = $conn->prepare("
        UPDATE product_quantities
        SET
            ready_quantity = ready_quantity - 1,
            total_quantity = total_quantity - 1,
            sold_quantity = sold_quantity + 1
        WHERE product_id = ?
    ");


    // 4️⃣ Process each product
    foreach($product_ids as $product_id){

        $product_id = intval($product_id);

        if(!isset($sku_map[$product_id])){
            throw new Exception("Product not found: ".$product_id);
        }

        $sku = $sku_map[$product_id];

        // Insert order item
        $stmt_item->bind_param("iis", $order_id, $product_id, $sku);
        $stmt_item->execute();

        // Update stock
        $update_stock->bind_param("i", $product_id);
        $update_stock->execute();
    }

    $conn->commit();

    $response["status"] = true;
    $response["message"] = "Order created successfully.";
    $response["order_id"] = $order_id;

} catch(Exception $e){

    $conn->rollback();
    $response["message"] = $e->getMessage();
}

echo json_encode($response);