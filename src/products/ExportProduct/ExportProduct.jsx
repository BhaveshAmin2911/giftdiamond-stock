import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Link, useNavigate } from "react-router-dom";
import "./ExportProduct.css"
import { useSelector } from "react-redux";
import Select from "react-select";
import { FaSearch } from "react-icons/fa";
import DataTable from "react-data-table-component";
import { FaTrash } from "react-icons/fa";
import { dajDataTableStyles } from "../../Common/dataTableStyles";
import { dajSelectStyle } from "../../Common/reactSelectStyles";
import noDataImg from "../../assests/img/no-data-img.svg";
import { FaSpinner } from "react-icons/fa";

const ExportProduct = () => {
    const [products, setProducts] = useState([]);
    const [search_val, setsearch_val] = useState('');
    const [search_btn, setsearch_btn] = useState(true);
    const [karigar_filter, setkarigar_filter] = useState('');
    const [status_filter, setstatus_filter] = useState('');
    const [product_filter, setproduct_filter] = useState('normal');
    const [category_filter, setcategory_filter] = useState('');
    const [selection, setselection] = useState([]);
    const [loading, setloading] = useState(false);

    const navigate = useNavigate();

    const workTypes = useSelector(state => state.workTypes.list);
    const karigars = useSelector(state => state.karigars.list);
    const categories = useSelector(state => state.category.list);
    const colors = useSelector(state => state.colors.list);
    const polish_array = useSelector(state => state.polish.list);

    useEffect(() => {
        fetchProducts();
    }, [search_btn, category_filter]);

    const fetchProducts = async () => {
        setloading(true);

        try {
            const formData = new FormData();
            formData.append("search", search_val);
            formData.append("quantity_status", 'ready');
            formData.append("category_id", category_filter);
            formData.append("per_page", 300);

            const res = await api.post("/products/list.php", formData);
            if (res.data.status) {
                setProducts(res.data.data);
            }
        } catch (error) {
            console.error(error);
        }

        setloading(false);
    };

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    const handleSelect = (data) => {
        var old_array = [...selection];

        let index = old_array.findIndex((p_data) => p_data?.id == data?.id);
        if (index > -1) {
            old_array.splice(index, 1);
        } else {
            old_array.push(data);
        }

        setselection(old_array);
    }

    const handle_quantity = (id, val) => {
        var current = [...products];

        let index = current.findIndex((data) => data?.id == id);

        if (index > -1 && val <= Number(current[index].ready_quantity)) {
            let obj = current[index]
            let new_obj = Object.assign({}, current[index], { 'r_quantity': val })

            current.splice(index, 1, new_obj);
            setProducts(current);
        }
    }

    const update_selection = (id) => {
        var current = [...selection];
        var product_list = [...products];

        let index = current?.findIndex((data) => data?.id == id);
        let p_idx = product_list?.findIndex((data) => data?.id == id);


        if (index > -1 && p_idx > -1) {
            let obj = current[index]
            let new_obj = Object.assign({}, current[index], { 'r_quantity': (product_list?.[p_idx]?.r_quantity ? product_list[p_idx].r_quantity : 1) })

            current.splice(index, 1, new_obj);
            setselection(current);
        }
    }

    const submit_selection = async () => {

        let id_array = selection.map(pr => ({
            id: pr.id,
            quantity: Number(pr.r_quantity) || 1
        }));

        const key = `scan_${Date.now()}_${Math.random()}`;
        sessionStorage.setItem(key, JSON.stringify(id_array));
        window.open(`/print/order?key=${key}`, "_blank");
    }

    const Sell_data = () => {
        let id_array = selection.map(pr => ({
            id: pr.id,
            quantity: pr.r_quantity || 1
        }));

        const key = `scan_${Date.now()}_${Math.random()}`;
        sessionStorage.setItem(key, JSON.stringify(id_array));
        window.open(`/generate/order?key=${key}`, "_blank");
    }

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            setsearch_btn(!search_btn)
        }
    };

    const print_label = async () => {

        let product_array = [];
        if (selection?.length > 0) {

            selection.map((product) => {
                let box_name = product?.box_name ? 'B:' + product?.box_name : '';
                if (product?.size) {
                    var design_no = product?.design_no ? 'D:' + product?.design_no : '';
                    design_no = design_no + "/" + product?.size;
                } else {
                    var design_no = product?.design_no ? 'D:' + product?.design_no : '';
                }
                var desgin_code = design_no ? design_no : box_name;

                let new_obj = {
                    "id": product?.id,
                    "sku": product?.sku,
                    "copies": 1,
                    "code": 'SP-' + product?.code,
                    "box_name": box_name,
                    "design_no": desgin_code,
                    "copies": product?.r_quantity,
                }

                product_array.push(new_obj);
            })
        }

        const formData = new FormData();
        formData.append("product_array", JSON.stringify(product_array));

        const res = await api.post("/label/print-list.php", formData);
    }



    const displayValue = (value) => {
        if (value === null || value === undefined || value === "") {
            return "-";
        }
        return value;
    };
    const columns = [
        {
            name: "Select",
            width: "90px",
            cell: (row) => {
                const idx = selection.findIndex(
                    (item) => item.id === row.id
                );

                return (
                    <label className="daj-checkbox">
                        <input
                            type="checkbox"
                            checked={idx > -1}
                            onChange={() => handleSelect(row)}
                        />
                        <span className="daj-checkbox-mark"></span>
                    </label>
                );
            },
            center: true,
        },
        {
            name: "SKU",
            selector: (row) => displayValue(row.sku),
            sortable: true,
            center: true,
            minWidth: "150px",
        },
        {
            name: "Image",
            minWidth: "200px",
            cell: (row) => (
                <div className="daj-table-img-shell">
                    <img
                        src={row.image}
                        alt={row.sku}
                        className="daj-table-img"
                    />
                </div>
            ),

            center: true,
        },
        {
            name: "Code",
            selector: (row) => displayValue(row.code),
            sortable: true,
            center: true,
        },
        {
            name: "Color",
            cell: (row) => {
                const clr = colors.find(
                    (item) => item.id == row.color_id
                );

                return clr ? clr.name : "-";
            },
            center: true,
        },
        {
            name: "Polish",
            cell: (row) => {
                const pol = polish_array.find(
                    (item) => item.id == row.polish_id
                );

                return pol ? pol.name : "White";
            },
            center: true,
        },
        {
            name: "Updated",
            selector: (row) => displayValue(formatDateTime(row.updated_at)),
            sortable: true,
            minWidth: "200px",
            center: true,
        },
        {
            name: "Note",
            grow: 2,
            cell: (row) => displayValue(`${row.note ?? ""}${row.size ?? ""}`.trim()),
            center: true,
        },
        {
            name: "Quantity",
            width: "180px",
            center: true,
            cell: (row) => (
                <div className="flex items-center gap-2">

                    <input
                        className="w-20 rounded-lg border border-border px-2 py-1 text-center outline-none focus:border-primary"
                        type="number"
                        min={1}
                        max={row.ready_quantity}
                        value={row.r_quantity ? row.r_quantity : 1}
                        onChange={(e) =>
                            handle_quantity(
                                row.id,
                                e.target.value
                            )
                        }
                        onBlur={() =>
                            update_selection(row.id)
                        }
                    />

                    <span>
                        / {row.ready_quantity}
                    </span>

                </div>
            ),
        },
    ];
    const selectedColumns = [
        {
            name: "SKU",
            selector: (row) => `${row.sku}-${row.production_run}`,
            sortable: true,
            center: true,
            minWidth: "150px",
        },
        {
            name: "Image",
            minWidth: "200px",
            cell: (row) => (
                <div className="daj-table-img-shell">
                    <img
                        src={row.image}
                        alt={row.sku}
                        className="daj-table-img"
                    />
                </div>
            ),
            center: true,
        },
        {
            name: "Code",
            selector: (row) => row.code || "-",
            sortable: true,
            center: true,
        },
        {
            name: "Color",
            cell: (row) => {
                const clr = colors.find(
                    (item) => item.id == row.color_id
                );

                return clr ? clr.name : "-";
            },
            center: true,
        },
        {
            name: "Polish",
            cell: (row) => {
                const pol = polish_array.find(
                    (item) => item.id == row.polish_id
                );

                return pol ? pol.name : "White";
            },
            center: true,
        },
        {
            name: "Design No",
            selector: (row) => row.design_no || "-",
            sortable: true,
            center: true,
        },
        {
            name: "Quantity",
            selector: (row) => row.r_quantity || 1,
            center: true,
        },
        {
            name: "Action",
            center: true,
            width: "90px",
            cell: (row) => (
                <button
                    className="daj-export-remove-btn"
                    onClick={() => handleSelect(row)}
                    title="Remove"
                >
                    <FaTrash size={18} />
                </button>
            ),
        },
    ];

    return (
        <div className="daj-custom-container">

            <div className="daj-custom-header">

                <h2 className="daj-custom-header-title">
                    Export
                </h2>

                <div className="daj-export-toolbar">

                    {/* Search */}

                    <div className="daj-search-input">
                        <input
                            type="search"
                            className="daj-product-search-inp"
                            placeholder="Search Export..."
                            value={search_val}
                            onChange={(e) => setsearch_val(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />

                        <button
                            type="button"
                            className="daj-search-icon-btn"
                            onClick={() => setsearch_btn(!search_btn)}
                        >
                            <FaSearch size={18} />
                        </button>
                    </div>

                    {/* Category */}

                    {categories?.length > 0 && (
                        <div className="daj-export-category-select">

                            <Select
                                className="daj-react-select"
                                styles={dajSelectStyle}
                                placeholder="All Category"
                                options={[
                                    {
                                        value: "",
                                        label: "All Category",
                                    },
                                    ...categories.map((item) => ({
                                        value: item.id,
                                        label: item.name,
                                    })),
                                ]}
                                value={[
                                    {
                                        value: "",
                                        label: "All Category",
                                    },
                                    ...categories.map((item) => ({
                                        value: item.id,
                                        label: item.name,
                                    })),
                                ].find(
                                    (item) => item.value == category_filter
                                )}
                                onChange={(e) =>
                                    setcategory_filter(e.value)
                                }
                            />

                        </div>
                    )}

                    {/* Switch Buttons */}

                    <div className="daj-export-switcher">

                        <div className="daj-export-switcher-inner">

                            <button
                                className={`daj-export-switcher-btn ${product_filter === "normal"
                                    ? "daj-export-active-switcher"
                                    : ""
                                    }`}
                                onClick={() =>
                                    setproduct_filter("normal")
                                }
                            >
                                All Products
                            </button>

                            <button
                                className={`daj-export-switcher-btn ${product_filter === "selected"
                                    ? "daj-export-active-switcher"
                                    : ""
                                    }`}
                                onClick={() =>
                                    setproduct_filter("selected")
                                }
                            >
                                View Selection
                            </button>

                        </div>

                    </div>

                </div>

            </div>

            <div className="daj-product-list-body">
                {product_filter === "normal" && (
                    <div className="daj-table-wrapper">
                        <DataTable
                            columns={columns}
                            data={products}
                            customStyles={dajDataTableStyles}
                            responsive
                            highlightOnHover
                            striped
                            pagination
                            persistTableHead
                            noDataComponent={
                                <div className="daj-product-empty">

                                    <img
                                        src={noDataImg}
                                        alt="No Data Found"
                                        className="daj-product-no-data-img"
                                    />

                                    <h3 className="daj-product-no-data-title">
                                        No Products Found
                                    </h3>


                                </div>
                            }
                            progressPending={loading}
                            progressComponent={
                                <div className="daj-product-empty">
                                    <FaSpinner className="daj-spinner" />
                                </div>
                            }
                        />
                    </div>
                )}
                {product_filter === "selected" && (
                    <>
                        <div className="daj-table-wrapper">
                            <DataTable
                                columns={selectedColumns}
                                data={selection}
                                customStyles={dajDataTableStyles}
                                responsive
                                highlightOnHover
                                striped
                                pagination
                                persistTableHead
                                noDataComponent={
                                    <div className="daj-product-empty">

                                        <img
                                            src={noDataImg}
                                            alt="No Data Found"
                                            className="daj-product-no-data-img"
                                        />

                                        <h3 className="daj-product-no-data-title">
                                            No Products Found
                                        </h3>


                                    </div>
                                }
                            />
                        </div>


                        {selection.length > 0 && (
                            <div className="daj-print-sell-export">
                                <button
                                    className="daj-btn-primary"
                                    onClick={() => { submit_selection() }}
                                >
                                    Print
                                </button>

                                <button
                                    className="daj-btn-primary "
                                    onClick={() => { print_label() }}
                                >
                                    Label Print
                                </button>

                                <button
                                    className="daj-btn-primary "
                                    onClick={() => { Sell_data() }}
                                >
                                    Sell
                                </button>
                            </div>
                        )
                        }
                    </>
                )}

                {/* {
                    loading &&
                    <div className="daj-product-not-found">
                        Loading .....
                    </div>
                }

                {
                    products.length === 0 && !loading &&
                    <div className="daj-product-not-found">
                        No products found.
                    </div>
                } */}
            </div >
        </div >
    );
}

export default ExportProduct;