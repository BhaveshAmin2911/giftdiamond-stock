<?php

// ini_set('display_errors', 1);
// ini_set('display_startup_errors', 1);
// error_reporting(E_ALL);

require_once "../config/db.php";
require_once "../utils/auth.php";

$user_id = authenticate();

$product_id = $_POST["product_id"] ?? 0;
$note = $_POST["note"] ?? null;
$sku = $_POST["sku"] ?? null;
$work_type_id = $_POST["work_type_id"] ?? 0;
$setting_id = $_POST["setting_id"] ?? null;
$weight = $_POST["weight"] ?? 0;
// $quantity = $_POST["quantity"] ?? 0;
$karigar_rate = $_POST["rate"] ?? null;

/* BOX INPUT */
$box_id = $_POST["box_id"] ?? 0;
$new_box = trim($_POST["new_box"] ?? "");
$box_type = $_POST["box_type"] ?? ""; // casting / final

/* multiple settings support */
$settings = json_decode($_POST["settings"] ?? "[]", true);

/* multiple net weight support */
$net_weight_array = json_decode($_POST["net_weight_array"] ?? "[]", true);
// $net_weight_array = ['10.2', '10.1', '10.22', '10.2', '10.090'];

if (!$product_id || !$work_type_id) {
    echo json_encode([
        "status" => false,
        "message" => "Invalid request",
    ]);
    exit();
}

if (!empty($note)) {
    $stmt = $conn->prepare("
        UPDATE products
        SET 
        note = ?
        WHERE id = ?
    ");

    $stmt->bind_param("si", $note, $product_id); 
    $stmt->execute();
}

/* START TRANSACTION */
$conn->begin_transaction();

try {
    /* GET CURRENT KARIGAR */

    $q = $conn->prepare("
        SELECT current_karigar_id
        FROM products
        WHERE id = ?
    ");

    $q->bind_param("i", $product_id);
    $q->execute();

    $res = $q->get_result()->fetch_assoc();
    $karigar_id = $res["current_karigar_id"];

    /* BOX HANDLING (OPTIONAL) */

    if ($work_type_id == 1 && (!empty($box_id) || !empty($new_box))) {

        if (!empty($box_type) && $box_type != "casting") {
            throw new Exception("Invalid box type");
        }

        /* CREATE NEW BOX */
        if (!empty($new_box)) {
            $check = $conn->prepare("
                SELECT id FROM boxes 
                WHERE name = ? AND type = ?
                LIMIT 1
            ");

            $check->bind_param("ss", $new_box, $box_type);
            $check->execute();

            $existing = $check->get_result()->fetch_assoc();

            if ($existing) {
                $box_id = $existing["id"];
            } else {
                $stmt = $conn->prepare("
                    INSERT INTO boxes (name, type)
                    VALUES (?,?)
                ");

                $stmt->bind_param("ss", $new_box, $box_type);
                $stmt->execute();

                $box_id = $conn->insert_id;
            }
        }

        /* VALIDATE BOX */
        if (!empty($box_id)) {
            $check = $conn->prepare("
                SELECT id FROM boxes 
                WHERE id = ? AND type = 'casting'
            ");

            $check->bind_param("i", $box_id);
            $check->execute();

            if (!$check->get_result()->fetch_assoc()) {
                throw new Exception("Invalid casting box");
            }
        }
    }

    /* CASTING OR GILET KARIGAR RATE */

    if ($work_type_id == 1 || $work_type_id == 3) {
        if (!empty($karigar_rate)) {
            $rate = $karigar_rate;
        } else {
            if ($work_type_id == 1) {
                $q = $conn->prepare("
                    SELECT rate
                    FROM karigar_work_rates
                    WHERE karigar_id = ?
                    AND work_type_id = ?
                    LIMIT 1
                ");

                $q->bind_param("ii", $karigar_id, $work_type_id);
                $q->execute();
            } elseif ($work_type_id == 3) {
                $q = $conn->prepare("
                    SELECT rate
                    FROM karigar_work_rates
                    WHERE karigar_id = ?
                    AND work_type_id = ?
                    AND setting_type_id = ?
                    LIMIT 1
                ");

                $q->bind_param("iii", $karigar_id, $work_type_id, $setting_id);
                $q->execute();
            }

            $rateData = $q->get_result()->fetch_assoc();
            $rate = $rateData["rate"] ?? 0;
        }

    }

    /* MULTIPLE SETTING LABOUR */

    if ($work_type_id == 2) {
        foreach ($settings as $setting) {
            $setting_type_id = $setting["id"];
            $qty = $setting["quantity"];

            if ($qty <= 0) continue;

            if (!empty($setting["rate"])) {
                $rate = $setting["rate"];
            } else {
                $q = $conn->prepare("
                    SELECT rate
                    FROM karigar_work_rates
                    WHERE karigar_id = ?
                    AND work_type_id = ?
                    AND setting_type_id = ?
                    LIMIT 1
                ");

                $q->bind_param("iii", $karigar_id, $work_type_id, $setting_type_id);
                $q->execute();

                $rateData = $q->get_result()->fetch_assoc();
                $rate = $rateData["rate"] ?? 0;
            }

            $amount = $qty * $rate;

            $stmt = $conn->prepare("
                INSERT INTO product_work_history
                (product_id, work_type_id, setting_type_id, karigar_id, weight, rate, amount)
                VALUES
                (?,?,?,?,?,?,?)
            ");

            $stmt->bind_param(
                "iiiiddd",
                $product_id,
                $work_type_id,
                $setting_type_id,
                $karigar_id,
                $qty,
                $rate,
                $amount
            );

            $stmt->execute();

            $stmt = $conn->prepare("
                INSERT INTO product_setting_quantities
                (product_id, setting_type_id, quantity)
                VALUES (?,?,?)
                ON DUPLICATE KEY UPDATE
                quantity = VALUES(quantity)
            ");

            $stmt->bind_param("iii", $product_id, $setting_type_id, $qty);
            $stmt->execute();
        }
    }

    /* UPDATE PRODUCT */

    if ($work_type_id == 1) {

        if (!empty($box_id)) {

            $stmt = $conn->prepare("
                UPDATE products
                SET 
                net_weight = ?,
                casting_box_id = ?,
                current_stage = NULL,
                current_karigar_id = NULL,
                updated_at = NOW()
                WHERE id = ?
            ");

            $stmt->bind_param("dii", $net_weight_array[0], $box_id, $product_id);

        } else {

            $stmt = $conn->prepare("
                UPDATE products
                SET 
                net_weight = ?,
                current_stage = NULL,
                current_karigar_id = NULL,
                updated_at = NOW()
                WHERE id = ?
            ");

            $stmt->bind_param("di", $net_weight_array[0], $product_id);
        }

        $stmt->execute();
        $amount = $net_weight_array[0] * $rate;

        $stmt = $conn->prepare("
            INSERT INTO product_work_history
            (product_id, work_type_id, karigar_id, weight, rate, amount)
            VALUES
            (?,?,?,?,?,?)
        ");

        $stmt->bind_param(
            "iiiddd",
            $product_id,
            $work_type_id,
            $karigar_id,
            $net_weight_array[0],
            $rate,
            $amount
        );

        $stmt->execute();









/* GET LAST PRODUCTION RUN */

    $q = $conn->prepare("
        SELECT IFNULL(MAX(production_run),1) as last_run
        FROM products
        WHERE sku = ?
    ");

    $q->bind_param("s", $sku);
    $q->execute();

    $row = $q->get_result()->fetch_assoc();
    $last_run = $row["last_run"];

    // /* GET CASTING HISTORY */

    // $q = $conn->prepare("
    //     SELECT karigar_id, rate
    //     FROM product_work_history
    //     WHERE product_id = ?
    //     AND work_type_id = 1
    //     ORDER BY id DESC
    //     LIMIT 1
    // ");

    // $q->bind_param("i", $product_id);
    // $q->execute();

    // $casting = $q->get_result()->fetch_assoc();

    // $casting_karigar = $casting["karigar_id"] ?? null;
    // $casting_rate = $casting["rate"] ?? 0;

    /* CREATE NEW PRODUCT RUNS */

    // for ($i = 2; $i <= count($net_weight_array); $i++) {
    foreach ($net_weight_array as $index => $weight) {

        if ( $index == 0 ) continue;
        $last_run++;

        /* create product */

        if (!empty($box_id)) {
            $stmt = $conn->prepare("
                INSERT INTO products
                (
                sku,
                production_run,
                image,
                net_weight,
                casting_box_id,
                current_stage,
                current_karigar_id,
                status,
                created_by
                )
                SELECT
                sku,
                ?,
                image,
                ?,
                ?,
                current_stage,
                current_karigar_id,
                status,
                created_by
                FROM products
                WHERE id = ?
            ");
    
            $stmt->bind_param("issi", $last_run, $weight, $box_id, $product_id);
        } else {
            $stmt = $conn->prepare("
                INSERT INTO products
                (
                sku,
                production_run,
                image,
                net_weight,
                current_stage,
                current_karigar_id,
                status,
                created_by
                )
                SELECT
                sku,
                ?,
                image,
                ?,
                current_stage,
                current_karigar_id,
                status,
                created_by
                FROM products
                WHERE id = ?
            ");
    
            $stmt->bind_param("isi", $last_run, $weight, $product_id);
        }
        $stmt->execute();

        $new_product_id = $conn->insert_id;

        /* copy setting quantities */

        $stmt = $conn->prepare("
            INSERT INTO product_setting_quantities
            (product_id, setting_type_id, quantity)
            SELECT ?, setting_type_id, quantity
            FROM product_setting_quantities
            WHERE product_id = ?
        ");

        $stmt->bind_param("ii", $new_product_id, $product_id);
        $stmt->execute();

        /* insert casting history */

        $amount = $weight * $rate;

        $stmt = $conn->prepare("
            INSERT INTO product_work_history
            (product_id, work_type_id, karigar_id, weight, rate, amount)
            VALUES
            (?,?,?,?,?,?)
        ");

        $work_type_id = 1;

        $stmt->bind_param(
            "iiiddd",
            $new_product_id,
            $work_type_id,
            $karigar_id,
            $weight,
            $rate,
            $amount
        );

        $stmt->execute();

        /* create quantity row */

        $stmt = $conn->prepare("
            INSERT INTO product_quantities
            (product_id, casting_quantity, process_quantity, ready_quantity, total_quantity)
            VALUES
            (?,1,0,0,1)
        ");

        $stmt->bind_param("i", $new_product_id);
        $stmt->execute();
    }





















        

        $quantity = 1; 

            $q = $conn->prepare("
                UPDATE product_quantities
                SET 
                casting_quantity = casting_quantity + ?,
                total_quantity = total_quantity + ?
                WHERE product_id = ?
            ");

            $q->bind_param("iii", $quantity, $quantity, $product_id);
            $q->execute();
        // }

    } elseif ($work_type_id == 3) {

        $stmt = $conn->prepare("
            UPDATE products
            SET 
            gross_weight = ?,
            current_stage = NULL,
            current_karigar_id = NULL,
            updated_at = NOW()
            WHERE id = ?
        ");

        $stmt->bind_param("di", $weight, $product_id);
        $stmt->execute();

        $amount = $weight * $rate;

        $stmt = $conn->prepare("
            INSERT INTO product_work_history
            (product_id, work_type_id, karigar_id, weight, rate, amount)
            VALUES
            (?,?,?,?,?,?)
        ");

        $stmt->bind_param(
            "iiiddd",
            $product_id,
            $work_type_id,
            $karigar_id,
            $weight,
            $rate,
            $amount
        );

        $stmt->execute();

    } else {

        $stmt = $conn->prepare("
            UPDATE products
            SET 
            current_stage = NULL,
            current_karigar_id = NULL,
            updated_at = NOW()
            WHERE id = ?
        ");

        $stmt->bind_param("i", $product_id);
        $stmt->execute();
    }

    /* PRODUCT QUANTITY */

    $q = $conn->prepare("
        SELECT 
        casting_quantity,
        process_quantity,
        ready_quantity,
        total_quantity
        FROM product_quantities
        WHERE product_id = ?
    ");

    $q->bind_param("i", $product_id);
    $q->execute();

    $quantities = $q->get_result()->fetch_assoc();

    /* GET FULL WORK HISTORY */

    $q = $conn->prepare("
        SELECT 
        h.id,
        wt.work_name AS work_type,
        st.name AS setting_type,
        k.name AS karigar,
        h.weight,
        h.rate,
        h.amount
        FROM product_work_history h
        LEFT JOIN work_types wt ON h.work_type_id = wt.id
        LEFT JOIN setting_types st ON h.setting_type_id = st.id
        LEFT JOIN karigars k ON h.karigar_id = k.id
        WHERE h.product_id = ?
        ORDER BY h.id DESC
    ");

    $q->bind_param("i", $product_id);
    $q->execute();

    $result = $q->get_result();

    $history = [];

    while ($row = $result->fetch_assoc()) {
        $history[] = $row;
    }

    $conn->commit();

    echo json_encode([
        "status" => true,
        "message" => "Work updated successfully",
        "history" => $history,
        "quantities" => $quantities,
    ]);

} catch (Exception $e) {

    $conn->rollback();

    echo json_encode([
        "status" => false,
        "message" => $e->getMessage(),
    ]);
}