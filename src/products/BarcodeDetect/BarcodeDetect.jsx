import { useEffect, useState } from "react";
import api from "../../api/axios";
import './BarcodeDetect.scss'
import { useNavigate } from "react-router-dom";

export default function BarcodeListener() {
    const [barcode, setBarcode] = useState("");
    const [product_list, setproduct_list] = useState([]);
    const [manual_scan, setmanual_scan] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        let buffer = "";
        let lastTime = Date.now();

        const handleKeyDown = (e) => {
            if (!e.key || e.key === "Unidentified") return;

            const now = Date.now();

            if (now - lastTime > 50) {
                buffer = "";
            }

            lastTime = now;

            if (e.key === "Enter") {
                if (buffer) {
                    setBarcode(buffer);
                }
                buffer = "";
            }
            else if (/^[a-zA-Z0-9-_./]$/.test(e.key)) {
                buffer += e.key;
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    useEffect(() => {
        if (barcode) {
            get_product(barcode);
        }
    }, [barcode])

    const get_product = async (barcode) => {
        // let scan_array = barcode?.split('-');
        // var pr = 1;

        // if (scan_array?.length > 0) {
        //     pr = scan_array[(scan_array?.length - 1)];
        // }

        // let sku = scan_array.slice(0, -1).join("-").trim();

        const formData = new FormData();
        formData.append("sku", barcode);
        // formData.append("production_run", pr);

        const res = await api.post("/products/scan-product.php", formData);
        if (res.data?.status) {
            let old_array = [...product_list];
            if (res?.data?.data) {
                old_array.push(res.data.data);
                setproduct_list(old_array);
                setBarcode();
            }
        } else {
            let error_message = res?.data?.message ? res.data.message : 'Product not found';
            alert(error_message);
        }
    }

    const handleSelect = (idx) => {
        let current_list = [...product_list];

        current_list.splice(idx, 1);
        setproduct_list(current_list);
    }

    const Print_data = () => {
        let id_array = product_list.map(pr => pr.id);

        const key = `scan_${Date.now()}_${Math.random()}`;
        sessionStorage.setItem(key, JSON.stringify(id_array));
        window.open(`/print/order?key=${key}`, "_blank");
    }

    const Sell_data = () => {
        const result = Object.values(
            product_list.reduce((acc, item) => {
                const key = `${item.id}_${item.sku}`;

                if (!acc[key]) {
                    acc[key] = {
                        id: item.id,
                        sku: item.sku,
                        quantity: 0
                    };
                }

                acc[key].quantity++;

                return acc;
            }, {})
        );
        
        // let id_array = product_list.map(pr => pr.id);

        const key = `scan_${Date.now()}_${Math.random()}`;
        sessionStorage.setItem(key, JSON.stringify(result));
        window.open(`/generate/order?key=${key}`, "_blank");
    }

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            setBarcode(manual_scan);
            setmanual_scan('');
        }
    };

    return (
        <div className="daj-gun-scanner-list">
            <div className="daj-gun-scanner-header">
                <div className="daj-manual-scan-bar">
                    <input className="daj-manual-scan-inp" onKeyDown={(e) => handleKeyDown(e)} type="text" value={manual_scan} onChange={(e) => setmanual_scan(e.target.value)} />
                    <button className="daj-manual-scan-btn" onClick={() => { setBarcode(manual_scan); setmanual_scan(''); }}>{'>'}</button>
                </div>
                <span className="daj-scanner-last-val">Last Scan: {barcode}</span>
            </div>
            <table className="daj-product-table">
                <thead className="daj-product-table-head">
                    <tr>
                        <th className="p-3">SKU</th>
                        <th className="p-3">Image</th>
                        <th className="p-3">Code</th>
                        <th className="p-3">Design No</th>
                        {/* <th className="p-3">Action</th> */}
                        <th className="p-3">Remove</th>
                    </tr>
                </thead>
                <tbody className="daj-product-table-body">
                    {product_list.length > 0 && product_list.map((p, index) => {
                        return (
                            <tr className="border-t" key={index}>
                                <td className="p-3">{p.sku}</td>
                                <td className="daj-table-img-shell">
                                    <img className="daj-product-img" src={p.image} />
                                </td>
                                <td className="p-3">{p.code}</td>
                                <td className="p-3">{p.design_no}</td>
                                {/* <td className="p-3">₹ {(Math.round((p.total_labour) / 10) * 10)}</td> */}
                                {/* <td className="p-3">
                                    <div className="daj-table-action-shell">
                                        <Link to={`/products/view/${p.id}`} className="daj-table-action" > View </Link>
                                    </div>
                                </td> */}
                                <td className="p-3">
                                    <div className="daj-table-action-shell">
                                        <button className="daj-table-action" onClick={() => handleSelect(index)}> Remove </button>
                                    </div>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
            {product_list.length > 0 &&
                <div className="daj-gun-scanner-opt">
                    <button className="daj-gun-scanner-print-btn" onClick={() => Print_data()}>Print</button>
                    <button className="daj-gun-scanner-print-btn" onClick={() => Sell_data()}>Sell</button>
                </div>
            }
        </div>
    );
}