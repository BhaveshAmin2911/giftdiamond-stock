import { useEffect, useState } from "react";
import api from "../../api/axios";
import './OrderList.css'
import { useDispatch } from "react-redux";
import DataTable from "react-data-table-component";
import { FaEye } from "react-icons/fa";
import { dajDataTableStyles } from "../../Common/dataTableStyles";

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
    const isMobile = window.innerWidth < 768;

    const columns = [
        {
            name: "Order ID",
            selector: row => row.id,
            center: true,
            sortable: true,
            minWidth: isMobile ? "120px" : ""

        },
        {
            name: "Customer Name",
            selector: row => {
                const customer = customer_list.find(
                    c => c.id == row.customer_id
                );

                return customer?.name || "--";
            },
            sortable: true,
            wrap: true,
            center: true,
            grow: 2,
            minWidth: isMobile ? "200px" : ""
        },
        {
            name: "Date",
            selector: row => row.order_date || "--",
            sortable: true,
            center: true,
            minWidth: isMobile ? "250px" : ""
        },
        {
            name: "View",
            center: true,
            cell: row => {
                const customer = customer_list.find(
                    c => c.id == row.customer_id
                );

                return (
                    <button
                        className="daj-order-view-btn"
                        onClick={() =>
                            view_data(
                                row.product_ids,
                                customer,
                                row.id
                            )
                        }
                    >
                        <FaEye />
                    </button>
                );
            },
        },
    ];
    return (
        <div className="daj-custom-container">

            <div className="daj-order-header">
                <h2 className="daj-custom-header-title">
                    Order Details
                </h2>
            </div>

            <div className="daj-table-wrapper">

                <DataTable
                    columns={columns}
                    data={order_list}
                    customStyles={dajDataTableStyles}
                    pagination
                    paginationPerPage={10}
                    paginationRowsPerPageOptions={[10, 20, 50, 100]}
                    highlightOnHover
                    striped
                    responsive
                    persistTableHead
                    noDataComponent={
                        <div className="py-6 text-center text-gray-500">
                            No Orders Found
                        </div>
                    }
                />

            </div>

        </div>
    );
}

export default OrderList;