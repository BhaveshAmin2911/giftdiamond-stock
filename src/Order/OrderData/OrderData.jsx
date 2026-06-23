import { useEffect, useState } from "react";
import './OrderData.scss'
import { useDispatch, useSelector } from "react-redux";
import api from "../../api/axios";

const OrderData = () => {
    const params = new URLSearchParams(window.location.search);
    const key = params.get("key");

    const product_array = JSON.parse(sessionStorage.getItem(key));

    // remove after use
    sessionStorage.removeItem(key);

    const [product_list, setproduct_list] = useState([]);
    const [customer, setcustomer] = useState();
    const [order_id, setorder_id] = useState(213);
    const [ad_product, setad_product] = useState([]);
    const [prd_quant, setprd_quant] = useState([]);
    const [order_total, setorder_total] = useState(0);
    const [total_order, settotal_order] = useState({ 'net_weight': 0, 'gross_weight': 0, 'LP': 0 });

    useEffect(() => {
        if (product_array?.order_list?.length > 0) {
            get_product(product_array.order_list);
            get_product(product_array.order_list);
            setcustomer(product_array?.customer);
            setorder_id(product_array?.order_id)
        }
    }, [product_array])

    const get_product = async (pr_array) => {

        const formData = new FormData();
        formData.append("product_ids", JSON.stringify(pr_array));

        const res = await api.post("/order/order-products.php", formData);

        if (res?.data?.status) {
            let p_array = res?.data?.products;
            setproduct_list(p_array);
            getorder_total(p_array, pr_array);
        }
    }

    const getorder_total = (p_array, data_array) => {

        var total_code = 0;
        if (p_array?.length > 0) {
            p_array.map((p_data) => {
                let q_idx = data_array.findIndex((data) => data?.id == p_data?.id);
                var quantity = 1;

                if (q_idx > -1) {
                    quantity = Number(data_array[q_idx]?.quantity);
                }

                let code = Number(p_data?.code);
                total_code = total_code + Number(code * quantity);

                setorder_total(total_code);
            })
        }
    }

    const get_date = () => {
        const today = new Date();

        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        const day = today.getDate();

        return day + '-' + month + '-' + year;
    }

    return (
        <div className="daj-bill-order-con">
            <div className="daj-order-customer-con">

                <div className="daj-order-customer-detail">
                    <div className="daj-order-customer-data">
                        <div className="daj-bill-date-id">
                            <div className="daj-bill-date">
                                <span className="daj-customer-data-title">Order ID : </span>
                                <span className="daj-bill-data-val">{order_id}</span>
                            </div>
                            <div className="daj-bill-date">
                                <span className="daj-customer-data-title">Date : </span>
                                <span className="daj-bill-data-val">{get_date()}</span>
                            </div>
                        </div>
                        <div className="daj-customer-data-con">
                            <div className="daj-customer-data-value">
                                <span className="daj-customer-data-title">Name : </span>
                                <span className="daj-customer-data-val">{customer?.name ? customer.name : 'None'}</span>
                            </div>
                            <div className="daj-customer-data-value">
                                <span className="daj-customer-data-title">Number : </span>
                                <span className="daj-customer-data-val">{customer?.phone ? customer.phone : 'None'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <hr className="daj-order-data-separater" />
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
                                                            <table border="0" cellSpacing="0" cellPadding="4" width="120" >
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
            <hr className="daj-order-data-separater" />
            <table border="1" cellSpacing="0" cellPadding="7">
                <tbody>
                    <tr>
                        <td>
                            <table border="1" cellSpacing="0" cellPadding="2" width='380'>
                                <tbody>
                                    <tr>
                                        <td colSpan={2} width='50%' style={{ textAlign: 'center' }}>Order Total</td>
                                    </tr>
                                    <tr>
                                        <td>Code</td>
                                        <td>{order_total}</td>
                                    </tr>
                                    <tr>
                                        <td>Price</td>
                                        <td>{Math.ceil(order_total / 3)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

export default OrderData;