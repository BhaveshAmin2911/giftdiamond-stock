<?php

require_once("../config/db.php");
require_once("../utils/auth.php");

/* Authenticate user */
$user_id = authenticate();

/* Get current user role */
$stmt = $conn->prepare("SELECT role FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();
$currentUser = $result->fetch_assoc();

/* Only admin can create users */
if ($currentUser['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode([
        "status" => false,
        "message" => "Access denied"
    ]);
    exit;
}

/* Get input */
$data = json_decode(file_get_contents("php://input"), true);

$name = $data['name'] ?? '';
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';
$role = $data['role'] ?? 'staff';

if (!$name || !$email || !$password) {
    echo json_encode([
        "status" => false,
        "message" => "All fields required"
    ]);
    exit;
}

/* Check if email exists */
$stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    echo json_encode([
        "status" => false,
        "message" => "Email already exists"
    ]);
    exit;
}

/* Hash password */
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

/* Insert user */
$stmt = $conn->prepare("
    INSERT INTO users (name, email, password, role, status)
    VALUES (?, ?, ?, ?, 'active')
");
$stmt->bind_param("ssss", $name, $email, $hashedPassword, $role);
$stmt->execute();

/* Log activity */
$stmt = $conn->prepare("
    INSERT INTO activity_logs (user_id, action, table_name, record_id, description)
    VALUES (?, 'CREATE', 'users', ?, ?)
");

$newUserId = $conn->insert_id;
$description = "Created user: " . $email;

$stmt->bind_param("iis", $user_id, $newUserId, $description);
$stmt->execute();

echo json_encode([
    "status" => true,
    "message" => "User created successfully"
]);