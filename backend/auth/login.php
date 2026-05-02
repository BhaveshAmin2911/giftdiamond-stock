<?php
require_once("../config/db.php");

$data = json_decode(file_get_contents("php://input"), true);

$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

if (!$email || !$password) {
    echo json_encode([
        "status" => false,
        "message" => "Email and password required"
    ]);
    exit;
}

$stmt = $conn->prepare("SELECT id, name, password, role FROM users WHERE email = ? AND status = 'active'");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode([
        "status" => false,
        "message" => "Invalid credentials"
    ]);
    exit;
}

$user = $result->fetch_assoc();

if (!password_verify($password, $user['password'])) {
    echo json_encode([
        "status" => false,
        "message" => "Invalid credentials"
    ]);
    exit;
}

/* Simple Token */
$remember = $data['remember'] ?? false;

$token = bin2hex(random_bytes(32));

/* Decide expiry */
if ($remember) {
    $expires_at = date("Y-m-d H:i:s", strtotime("+3 months"));
    $is_remember = 1;
} else {
    $expires_at = date("Y-m-d H:i:s", strtotime("+3 days"));
    $is_remember = 0;
}

/* Delete expired tokens first */
$stmt = $conn->prepare("DELETE FROM user_tokens WHERE user_id = ? AND expires_at < NOW()");
$stmt->bind_param("i", $user['id']);
$stmt->execute();

/* Check active tokens count */
$stmt = $conn->prepare("SELECT COUNT(*) as total FROM user_tokens WHERE user_id = ?");
$stmt->bind_param("i", $user['id']);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();

/* Remove expired tokens first */
$stmt = $conn->prepare("DELETE FROM user_tokens WHERE user_id = ? AND expires_at < NOW()");
$stmt->bind_param("i", $user['id']);
$stmt->execute();

/* Check active tokens */
$stmt = $conn->prepare("SELECT id FROM user_tokens WHERE user_id = ? ORDER BY created_at ASC");
$stmt->bind_param("i", $user['id']);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows >= 7) {
    /* Delete oldest token */
    $oldest = $result->fetch_assoc();
    $deleteStmt = $conn->prepare("DELETE FROM user_tokens WHERE id = ?");
    $deleteStmt->bind_param("i", $oldest['id']);
    $deleteStmt->execute();
}

/* Insert new token */
$stmt = $conn->prepare("INSERT INTO user_tokens (user_id, token, expires_at, is_remember) VALUES (?, ?, ?, ?)");
$stmt->bind_param("issi", $user['id'], $token, $expires_at, $is_remember);
$stmt->execute();

echo json_encode([
    "status" => true,
    "message" => "Login successful",
    "data" => [
        "user_id" => $user['id'],
        "name" => $user['name'],
        "role" => $user['role'],
        "token" => $token
    ]
]);