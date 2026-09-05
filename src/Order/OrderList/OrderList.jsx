import { useEffect, useState } from "react";
import api from "../../api/axios";
import './OrderList.css'
import { useDispatch } from "react-redux";
import DataTable from "react-data-table-component";
import { FaEye, FaSearch } from "react-icons/fa";
import { dajDataTableStyles } from "../../Common/dataTableStyles";

const OrderList = () => {

    const [order_list, setorder_list] = useState([]);
    const [customer_list, setcustomer_list] = useState([]);
    const [search_val, setsearch_val] = useState("");
    const [search_btn, setsearch_btn] = useState(true);
    const [loading, setloading] = useState(false);
    const [product_total, setproduct_total] = useState(0);
    const [perpage, setperpage] = useState(10);
    const [current_page, setcurrent_page] = useState(1);

    useEffect(() => {
        get_customer();
    }, [])

    useEffect(() => {
        get_order_data()
    }, [search_btn, perpage])

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            setsearch_btn(!search_btn)
        }
    };

    const get_customer = async () => {
        const res = await api.get("/customers/list.php");
        const customer_data = res?.data?.data;
        setcustomer_list(customer_data);
    }

    const get_order_data = async (page = 1) => {
        setloading(true);
        setcurrent_page(page);

        let formData = new FormData;

        formData.append("search", search_val);
        formData.append("page", page);
        formData.append("limit", perpage);

        const res = await api.post("/order/order-list.php", formData);

        if (res?.data?.status && res?.data?.data?.length > 0) {
            setproduct_total(res.data.pagination.total);
            setorder_list(res.data.data);
        }

        setloading(false);
    }

    const view_data = (id_array, customer, id, price_unit) => {
        if (id_array?.length > 0) {
            let order_data = { 'order_list': id_array, 'customer': customer, order_id: id, price_unit: price_unit };

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
                        className="daj-action-btn-icon"
                        onClick={() =>
                            view_data(
                                row.product_ids,
                                customer,
                                row.id,
                                row.price_unit
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

            <div className="daj-product-filter-row">

                <div className="daj-search-input">
                    <input
                        type="search"
                        className="daj-product-search-inp"
                        placeholder="Search Export..."
                        value={search_val}
                        onChange={(e) => setsearch_val(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e)}
                    />

                    <button
                        type="button"
                        className="daj-search-icon-btn"
                        onClick={() => setsearch_btn(!search_btn)}
                    >
                        <FaSearch size={18} />
                    </button>
                </div>
            </div>

            <div className="daj-table-wrapper">

                <DataTable
                    columns={columns}
                    data={order_list}
                    customStyles={dajDataTableStyles}
                    pagination
                    paginationServer
                    paginationPerPage={perpage}
                    paginationTotalRows={product_total}
                    paginationDefaultPage={current_page}
                    onChangePage={(e) => { get_order_data(e) }}
                    onChangeRowsPerPage={(e) => setperpage(e)}
                    paginationRowsPerPageOptions={[10, 20, 50, 100]}
                    progressPending={loading}
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