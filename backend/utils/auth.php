<?php

require_once("../config/db.php");

function authenticate() {

    $headers = getallheaders();
    $token = $headers['Authorization'] ?? '';

    if (!$token) {
        echo json_encode([
            "status" => false,
            "message" => "Unauthorized - No token"
        ]);
        exit;
    }

    global $conn;

    // $stmt = $conn->prepare("SELECT user_id FROM user_tokens WHERE token = ?");
    $stmt = $conn->prepare("SELECT user_id FROM user_tokens WHERE token = ? AND expires_at > NOW()");
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode([
            "status" => false,
            "message" => "Unauthorized - Invalid token"
        ]);
        exit;
    }

    return $result->fetch_assoc()['user_id'];
}