<?php

require_once "../config/db.php";
require_once "../utils/auth.php";

$user_id = authenticate();

$product_id = $_POST["product_id"] ?? 0;
$stage = $_POST["stage"] ?? 0;
$karigar_id = $_POST["karigar_id"] ?? null;
// $quantity = $_POST["quantity"] ?? 0;

if (!$product_id || !$stage) {
    echo json_encode([
        "status" => false,
        "message" => "Product ID and stage required",
    ]);
    exit();
}

$conn->begin_transaction();

try {
    /* GET PRODUCT  */

    $q = $conn->prepare("
        SELECT id, sku, net_weight, production_run
        FROM products
        WHERE id = ?
    ");

    $q->bind_param("i", $product_id);
    $q->execute();

    $product = $q->get_result()->fetch_assoc();

    if (!$product) {
        throw new Exception("Product not found");
    }

    $sku = $product["sku"];
    $net_weight = $product["net_weight"];

    /* CHECK CASTING STOCK */

    if($stage == 2){
        $q = $conn->prepare("
            SELECT casting_quantity
            FROM product_quantities
            WHERE product_id = ?
        ");
    
        $q->bind_param("i", $product_id);
        $q->execute();
    
        $stock = $q->get_result()->fetch_assoc();

        // if (!$stock || $stock["casting_quantity"] < $quantity) {
        //     throw new Exception("Not enough casting pieces available");
        // }
    
        /* UPDATE PRODUCT QUANTITY*/
    
        $quantity = 1;
        $stmt = $conn->prepare("
            UPDATE product_quantities
            SET
            casting_quantity = 0,
            process_quantity = 1
            WHERE product_id = ?
        ");
    
        $stmt->bind_param("i", $product_id);
        $stmt->execute();
        
        // print_r($stmt);
    }

    /* UPDATE ORIGINAL PRODUCT */

    $stmt = $conn->prepare("
        UPDATE products
        SET
        current_stage = ?,
        current_karigar_id = ?,
        updated_at = NOW()
        WHERE id = ?
    ");

    $stmt->bind_param("iii", $stage, $karigar_id, $product_id);
    $stmt->execute();

    $conn->commit();

    echo json_encode([
        "status" => true,
        "message" => "Status updated successfully",
    ]);
} catch (Exception $e) {
    $conn->rollback();

    echo json_encode([
        "status" => false,
        "message" => $e->getMessage(),
    ]);
}
