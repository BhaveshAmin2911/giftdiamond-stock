<?php

require_once("../config/db.php");
require_once("../utils/auth.php");

/* =========================
   AUTH (TOKEN CHECK FIRST)
========================= */

$user_id = authenticate(); // already validates token

/* =========================
   GET USER DETAILS
========================= */

$q = $conn->prepare("
SELECT id, name, role
FROM users
WHERE id = ?
");

$q->bind_param("i",$user_id);
$q->execute();

$user = $q->get_result()->fetch_assoc();

/* =========================
   HELPER FUNCTION
========================= */

function getData($conn, $query){
    $result = $conn->query($query);
    $data = [];

    while($row = $result->fetch_assoc()){
        $data[] = $row;
    }

    return $data;
}

/* =========================
   LOAD ALL DATA
========================= */

$karigars = getData($conn, "SELECT id, name FROM karigars ORDER BY id ASC");

$colors = getData($conn, "SELECT id, name FROM product_colors ORDER BY id ASC");

$boxes = getData($conn, "SELECT id, name, type FROM boxes ORDER BY id ASC");

$categories = getData($conn, "SELECT id, name FROM product_categories ORDER BY id ASC");

$work_types = getData($conn, "SELECT id, work_name FROM work_types ORDER BY id ASC");

$setting_types = getData($conn, "SELECT id, name FROM setting_types ORDER BY id ASC");


/* =========================
   RESPONSE
========================= */

echo json_encode([
    "status" => true,
    "message" => "Bootstrap data loaded",
    
    "user" => $user,

    "data" => [
        "karigars" => $karigars,
        "colors" => $colors,
        "boxes" => $boxes,
        "categories" => $categories,
        "work_types" => $work_types,
        "setting_types" => $setting_types
    ]
]);