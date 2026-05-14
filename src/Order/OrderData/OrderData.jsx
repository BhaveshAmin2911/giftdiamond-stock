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
    const [total_order, settotal_order] = useState({ 'net_weight': 0, 'gross_weight': 0, 'LP': 0 });

    useEffect(() => {
        if (product_array?.order_list?.length > 0) {
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
            let ad_array = p_array.filter((product) => product.type == "AD");
            let polki_array = p_array.filter((product) => product.type != "AD");

            setproduct_list(polki_array);
            setad_product(ad_array);
            total_bill(polki_array);
        }
    }

    const total_bill = (data = product_list) => {
        let total_net = 0;
        let total_gross = 0;
        let total_lp = 0;

        if (data.length > 0) {
            data.map((product) => {
                total_net = total_net + Number(product?.net_weight.toFixed(2));
                total_gross = total_gross + Number(product?.gross_weight);
                total_lp = total_lp + Number(Math.ceil(product?.total_labour));
            })
        }

        let final_net = total_net.toFixed(2) + 0;
        let final_gross = total_gross.toFixed(2) + 0;
        let final_lp = total_lp;

        settotal_order({ 'net_weight': final_net, 'gross_weight': final_gross, 'LP': final_lp })
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
                                        <tbody>
                                            <tr>
                                                <td width='50%'>SKU</td>
                                                <td>{product?.sku + '-' + product?.production_run}</td>
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
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        );
                    })}
                    <tr>
                        <td colSpan={2} className="daj-customer-bill-total">Order Total</td>
                        <td>
                            <table border="1" cellSpacing="0" cellPadding="8" width='400'>
                                <tbody>
                                    <tr>
                                        <td width='50%'>Net weight</td>
                                        <td>{total_order?.net_weight + ' grm'}</td>
                                    </tr>
                                    <tr>
                                        <td width='50%'>Gross weight</td>
                                        <td>{total_order?.gross_weight + ' grm'}</td>
                                    </tr>
                                    <tr>
                                        <td width='50%'>LP</td>
                                        <td>{'₹ ' + total_order?.LP}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
            </table>
            <hr className="daj-order-data-separater" />
            <table border="1" cellSpacing="0" cellPadding="7">
                <tbody>
                    {ad_product.length > 0 && ad_product.map((product, index) => {

                        return (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td className="daj-order-print-image">
                                    <img src={product?.image} />
                                </td>
                                <td>
                                    <table border="1" cellSpacing="0" cellPadding="2" width='380'>
                                        <tbody>
                                            <tr>
                                                <td width='50%'>SKU</td>
                                                <td>{product?.sku + '-' + product?.production_run}</td>
                                            </tr>
                                            <tr>
                                                <td>Weight</td>
                                                <td>{product?.gross_weight + ' grm'}</td>
                                            </tr>
                                            <tr>
                                                <td>LBR</td>
                                                <td>{product?.total_labour}</td>
                                            </tr>
                                        </tbody>
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

export default OrderData;