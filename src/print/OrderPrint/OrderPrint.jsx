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
    const [get_print, setget_print] = useState(false);

    useEffect(() => {
        if (product_array?.length > 0) {
            get_product(product_array);
        }
    }, [product_array])

    useEffect(() => {
        if (get_print) {
            window.print();
        }
        setget_print(false);
    }, [get_print])

    const get_product = async (pr_array) => {
        const formData = new FormData();
        formData.append("product_ids", JSON.stringify(pr_array));

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
            <table border="1" cellSpacing="0" cellPadding="7">
                <tbody>
                    {product_list.length > 0 && product_list.map((product, index) => {
                        let polki_a = product?.settings?.polki_a ? Number(product.settings.polki_a) : 0;
                        let polki_b = product?.settings?.polki_b ? Number(product.settings.polki_b) : 0;
                        let total_polki = polki_a + polki_b;
                        return (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td className="daj-order-print-image">
                                    <img src={product?.image} />
                                </td>
                                <td>
                                    <table border="1" cellSpacing="0" cellPadding="2" width='380'>
                                        <tr>
                                            <td width='50%'>SKU</td>
                                            <td>{product?.sku}</td>
                                        </tr>
                                        <tr>
                                            <td>Net Weight</td>
                                            <td>{product?.net_weight.toFixed(2) + 0 + ' grm'}</td>
                                        </tr>
                                        <tr>
                                            <td>Gross Weight</td>
                                            <td>{product?.gross_weight + ' grm'}</td>
                                        </tr>
                                        <tr>
                                            <td>LP</td>
                                            <td>{'₹ ' + (Math.round((product?.total_labour) / 10) * 10)}</td>
                                        </tr>
                                        <tr>
                                            <td>Polki</td>
                                            <td>{total_polki}</td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default OrderPrint;