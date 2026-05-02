<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once("../config/db.php");
require_once("../utils/auth.php");

$response = [
    "status" => false,
    "message" => ""
];

try {

    $name    = isset($_POST['name']) ? trim($_POST['name']) : '';
    $phone   = isset($_POST['number']) ? trim($_POST['number']) : '';
    $address = isset($_POST['address']) ? trim($_POST['address']) : '';

    if(empty($name)){
        $response["message"] = "Customer name is required.";
        echo json_encode($response);
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO customers (name, phone, address) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $name, $phone, $address);

    if($stmt->execute()){
        
        /* NEW CUSTOMER LIST */

        $cus = $conn->query("
            SELECT id, name, phone, address
            FROM customers
            ORDER BY name ASC
        ");
    
        $data = [];
        
        while ($row = $cus->fetch_assoc()) {
            $data[] = $row;
        }
        
        $response["status"] = true;
        $response["message"] = "Customer created successfully.";
        $response["customer_id"] = $stmt->insert_id;
        $response["customer_list"] = $data;

    } else {

        $response["message"] = "Failed to create customer.";

    }

    echo json_encode($response);

} catch(Exception $e){

    $response["message"] = $e->getMessage();
    echo json_encode($response);

}