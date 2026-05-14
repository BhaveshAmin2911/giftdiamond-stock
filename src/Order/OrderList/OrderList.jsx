import { useEffect, useState } from "react";
import api from "../../api/axios";
import './OrderList.scss'
import { useDispatch } from "react-redux";

const OrderList = () => {

    const [order_list, setorder_list] = useState([]);
    const [customer_list, setcustomer_list] = useState([]);

    const dispatch = useDispatch();

    useEffect(() => {
        get_order_data()
        get_customer();
    }, [])

    const get_customer = async () => {
        const res = await api.get("/customers/list.php");
        const customer_data = res?.data?.data;
        setcustomer_list(customer_data);
    }

    const get_order_data = async () => {
        const res = await api.get("/order/order-list.php");

        if (res?.data?.status && res?.data?.data?.length > 0) {
            setorder_list(res.data.data);
        }

    }

    const view_data = (id_array, customer, id) => {
        if (id_array?.length > 0) {
            let order_data = { 'order_list': id_array, 'customer': customer, order_id: id };

            const key = `scan_${Date.now()}_${Math.random()}`;
            sessionStorage.setItem(key, JSON.stringify(order_data));
            window.open(`/order/products?key=${key}`, "_blank");
        }
    }

    return (
        <div className="daj-customer-order-con">
            <div>
                <span className="daj-customer-order-header">Order Details</span>
            </div>
            <table className="daj-order-table">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Customer Name</th>
                        <th>Date</th>
                        <th>View</th>
                    </tr>
                </thead>
                <tbody>
                    {order_list.map((order, index) => {
                        let idx = customer_list.findIndex((customer) => customer?.id == order.customer_id);
                        var customer_name = order?.customer_id;

                        if (idx > -1) {
                            customer_name = customer_list[idx].name;
                        }

                        return (
                            <tr>
                                <td>{order.id}</td>
                                <td style={{ textAlign: 'left' }}>{customer_name}</td>
                                <td>{order.order_date}</td>
                                <td>
                                    <button className="daj-oder-detail-view" onClick={() => view_data(order?.product_ids, customer_list[idx], order.id)}>View</button>
                                </td>
                            </tr>
                        );
                    })}
                    <tr></tr>
                </tbody>
            </table>
        </div>
    );
}

export default OrderList;