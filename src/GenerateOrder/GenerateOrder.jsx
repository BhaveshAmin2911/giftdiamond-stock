import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../api/axios";
import './GenerateOrder.scss'
import { setCustomers } from "../store/slices/customerSlice";
import { useDispatch, useSelector } from "react-redux";

const GenerateOrder = () => {
    const params = new URLSearchParams(window.location.search);
    const key = params.get("key");

    const product_array = JSON.parse(sessionStorage.getItem(key));
    const customers = useSelector(state => state.customers.list);


    // remove after use
    sessionStorage.removeItem(key);

    const [product_list, setproduct_list] = useState([]);
    const [selected_customer, setselected_customer] = useState();
    const [loading, setloading] = useState(false);
    const [ad_product, setad_product] = useState([]);
    const [total_order, settotal_order] = useState({ 'net_weight': 0, 'gross_weight': 0, 'LP': 0 });
    const dispatch = useDispatch();

    useEffect(() => {
        get_customer();
    }, [])

    useEffect(() => {
        if (product_array?.length > 0) {
            get_product(product_array);
        }
    }, [product_array])

    const get_customer = async () => {
        setloading(true);

        const res = await api.get("/customers/list.php");
        const customer_data = res?.data?.data;

        if (customer_data?.length > 0) {
            dispatch(setCustomers(customer_data));
        }

        setTimeout(() => {
            setloading(false);
        }, 800);
    }


    const get_product = async (pr_array) => {
        const formData = new FormData();
        formData.append("product_ids", JSON.stringify(pr_array));

        const res = await api.post("/products/products-billing.php", formData);

        if (res?.data?.status) {

            let p_array = res?.data?.products;
            let ad_array = p_array.filter((product) => product.type == "AD");
            let polki_array = p_array.filter((product) => product.type != "AD");

            setproduct_list(polki_array);
            setad_product(ad_array);
            total_bill(polki_array);
        }
    }

    const select_customer = (id) => {
        let index = customers.findIndex((cus) => cus.id == id);

        if (index > -1) {
            let customer_data = customers[index];
            setselected_customer(customer_data);
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

    const add_customer = () => {
        window.open(`/add/customer`, "_blank");
    }

    const final_bill = () => {
        if (!selected_customer) {
            alert('Please Select Customer !');

            return;
        }

        let text = 'Are you sure to confirm this order and reduce Quantity ??'
        if (window.confirm(text) == true) {
            let id_array = product_list.map(pr => pr.id);
            ad_product.map((pr) => id_array.push(pr.id));
            let order_data = { 'order_list': id_array, 'customer': selected_customer };

            const key = `scan_${Date.now()}_${Math.random()}`;
            sessionStorage.setItem(key, JSON.stringify(order_data));
            window.open(`/print/bill?key=${key}`, "_blank");
        }
    }

    return (
        <div className="daj-print-order-con">
            <div className="daj-order-customer-con">
                <div className="daj-order-customer-select">
                    <div className="daj-order-customer-select-con">
                        <span className="daj-order-customer-select-head">Select Customer</span>
                        <div className="daj-order-customer-select-body">
                            <select className="daj-order-customer-drp" onChange={(e) => select_customer(e.target.value)}>
                                <option value={''}>-- None --</option>
                                {customers.length > 0 &&
                                    customers.map((customer, index) => {
                                        return (
                                            <option value={customer.id} key={index}>{customer.name}</option>
                                        );
                                    })
                                }
                            </select>
                            <span className="daj-reload-customer-btn" onClick={() => get_customer()}>{loading ? 'Loading ...' : 'Reload Customer List'}</span>
                        </div>
                    </div>
                    <div className="daj-order-add-customer">
                        <button className="daj-order-add-customer-btn" onClick={() => add_customer()}>Add New Customer</button>
                    </div>
                </div>
                <div className="daj-order-customer-detail">
                    <div className="daj-order-customer-data">
                        <div className="daj-customer-data-value">
                            <span className="daj-customer-data-title">Name : </span>
                            <span className="daj-customer-data-val">{selected_customer?.name ? selected_customer.name : 'None'}</span>
                        </div>
                        <div className="daj-customer-data-value">
                            <span className="daj-customer-data-title">Number : </span>
                            <span className="daj-customer-data-val">{selected_customer?.phone ? selected_customer.phone : 'None'}</span>
                        </div>
                    </div>
                    {/* <div className="daj-order-customer-address">
                        <div className="daj-customer-data-value">
                            <span className="daj-customer-data-title">Address : </span>
                            <span className="daj-customer-data-val">{selected_customer?.address ? selected_customer.address : 'None'}</span>
                        </div>
                    </div> */}
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
                                                <td>{product?.total_lbr}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <div className="daj-bill-confirm-export">
                <button className="daj-bill-confirm-export-btn" onClick={() => { final_bill() }}>Generate Bill</button>
            </div>
        </div>
    );
}

export default GenerateOrder;