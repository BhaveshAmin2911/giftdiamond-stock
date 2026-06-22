import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useLocation } from "react-router-dom";
import './OrderPrint.scss'

const OrderPrint = () => {

    const params = new URLSearchParams(window.location.search);
    const key = params.get("key");

    const product_array = JSON.parse(sessionStorage.getItem(key));

    // remove after use
    sessionStorage.removeItem(key);

    const [product_list, setproduct_list] = useState([]);
    const [prd_quant, setprd_quant] = useState([]);
    const [get_print, setget_print] = useState(false);

    useEffect(() => {
        if (product_array?.length > 0) {
            get_product(product_array);
            setprd_quant(product_array);
        }
    }, [product_array])

    useEffect(() => {
        if (get_print) {
            window.print();
        }
        setget_print(false);
    }, [get_print])

    const get_product = async (pr_array) => {
        let id_array = pr_array.map(pr => pr.id);

        const formData = new FormData();
        formData.append("product_ids", JSON.stringify(id_array));

        const res = await api.post("/products/products-billing.php", formData);

        if (res?.data?.status) {
            setproduct_list(res?.data?.products);
            setTimeout(() => {
                setget_print(true);
            }, 1000);
        }
    }

    return (
        <div className="daj-print-order-con">
            <table border="0" cellSpacing="0" cellPadding="0">
                <tbody>
                    {Array.from({ length: Math.ceil(product_list.length / 3) }).map((_, rowIndex) => {
                        const rowItems = product_list.slice(rowIndex * 3, rowIndex * 3 + 3);

                        return (
                            <tr key={rowIndex}>

                                {rowItems.map((product, index) => {
                                    let q_idx = prd_quant.findIndex((data) => data?.id == product?.id);
                                    var quantity = 1;

                                    if (q_idx > -1) {
                                        quantity = prd_quant[q_idx]?.quantity;
                                    }

                                    let polki_a = product?.settings?.polki_a
                                        ? Number(product.settings.polki_a)
                                        : 0;

                                    let polki_b = product?.settings?.polki_b
                                        ? Number(product.settings.polki_b)
                                        : 0;

                                    let total_polki = polki_a + polki_b;

                                    return (
                                        <td key={index} style={{ border: 'none' }}>

                                            <table border="0" cellSpacing="2" cellPadding="2">
                                                <tbody>
                                                    <tr>
                                                        <td>{rowIndex * 3 + index + 1}</td>
                                                        <td className="daj-order-print-image" style={{ padding: '2px' }}>
                                                            <img src={product?.image} />
                                                        </td>
                                                        <td style={{ padding: '0px', border: 'none' }}>
                                                            <table border="0" cellSpacing="0" cellPadding="4" width="125" >
                                                                <tbody>
                                                                    <tr>
                                                                        <td colSpan="2" width="50%" style={{ textAlign: 'center' }}>{product?.category}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td width="50%">SKU</td>
                                                                        <td>{product?.sku}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td>Code</td>
                                                                        <td>{product?.code}</td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td>Quantity</td>
                                                                        <td>{quantity}</td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    );
                                })
                                }
                            </tr>
                        );
                    })
                    }
                </tbody>
            </table>
        </div>
    );
}

export default OrderPrint;