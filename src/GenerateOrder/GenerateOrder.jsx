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
    const [price_unit, setprice_unit] = useState(3);
    const [ad_product, setad_product] = useState([]);
    const [prd_quant, setprd_quant] = useState([]);
    const [order_total, setorder_total] = useState(0);
    const dispatch = useDispatch();

    useEffect(() => {
        get_customer();
    }, [])

    useEffect(() => {
        if (product_array?.length > 0) {
            get_product(product_array);
            setprd_quant(product_array);
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
        let id_array = pr_array.map(pr => pr.id);

        const formData = new FormData();
        formData.append("product_ids", JSON.stringify(id_array));

        const res = await api.post("/products/products-billing.php", formData);

        if (res?.data?.status) {

            let p_array = res?.data?.products;

            setproduct_list(p_array);
            getorder_total(p_array, pr_array)
        }
    }

    const select_customer = (id) => {
        let index = customers.findIndex((cus) => cus.id == id);

        if (index > -1) {
            let customer_data = customers[index];
            setselected_customer(customer_data);
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
            let order_data = { 'order_list': prd_quant, 'customer': selected_customer, 'price_unit': price_unit };

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
                            <span className="daj-reload-customer-btn" onClick={() => get_customer()}>{loading ? 'Loading ...' : 'Reload List'}</span>
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
                            <table border="1" cellSpacing="0" cellPadding="2" width='280'>
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
                                        <td>{Math.ceil(order_total / price_unit)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div className="daj-bill-confirm-export">
                <div className="daj-bill-unit-val">
                    <span>Enter Unit Value : </span>
                    <input className="daj-bill-unit-inp" type="number" onChange={(e) => { setprice_unit(e.target.value) }} value={price_unit} />
                </div>
                <button className="daj-bill-confirm-export-btn" onClick={() => { final_bill() }}>Generate Bill</button>
            </div>
        </div>
    );
}

export default GenerateOrder;