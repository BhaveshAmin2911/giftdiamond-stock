import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./ProductList.css"
import { useSelector } from "react-redux";
import Select from "react-select";
import { FiSearch } from "react-icons/fi";
import DataTable from "react-data-table-component";
import { FaEdit } from "react-icons/fa";
import noDataImg from "../../assests/img/no-data-img.svg";


function ProductList() {
    const [products, setProducts] = useState([]);
    const [search_val, setsearch_val] = useState('');
    const [p_code, setp_code] = useState('');
    const [search_btn, setsearch_btn] = useState(true);
    const [karigar_filter, setkarigar_filter] = useState('');
    const [category_filter, setcategory_filter] = useState('');
    const [color_filter, setcolor_filter] = useState('');
    const [loading, setloading] = useState(false);
    const [select_print, setselect_print] = useState([]);
    const [time_order, settime_order] = useState(false);
    const [print_opt, setprint_opt] = useState(false);

    const workTypes = useSelector(state => state.workTypes.list);
    const karigars = useSelector(state => state.karigars.list);
    const categories = useSelector(state => state.category.list);
    const colors = useSelector(state => state.colors.list);
    const polish_array = useSelector(state => state.polish.list);
    const userData = useSelector(state => state.auth.data);

    const location = useLocation();
    const history = useNavigate();

    let deadline_data = [{ id: 1, day: 7 }, { id: 2, day: 7 }, { id: 3, day: 3 }];

    useEffect(() => {
        if (!loading) {
            fetchProducts();
        }
    }, [karigar_filter, color_filter, search_btn, category_filter, time_order]);

    const fetchProducts = async () => {
        setloading(true);

        try {
            const formData = new FormData();
            formData.append("search", search_val);
            formData.append("product_code", p_code);
            if (userData.user.role == 'karigar' && userData.user.role_id) {
                formData.append("karigar_id", userData.user.role_id);
            } else {
                formData.append("karigar_id", karigar_filter);
            }
            formData.append("category_id", category_filter);
            formData.append("color", color_filter);
            formData.append("quantity_status", 'process');

            if (time_order) {
                formData.append("p_order", 'time');
            }

            formData.append("status", 'in_progress');
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

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            setsearch_btn(!search_btn)
        }
    };

    const handle_print = (data) => {
        let current_list = [...select_print];
        let index = current_list.findIndex((p_data) => p_data?.id == data?.id)

        if (index > -1) {
            current_list.splice(index, 1);
        } else {
            current_list.push(data);
        }

        setselect_print(current_list);
    }

    //*********************SELECT INPUT CODE************************* *//

    const print_selected = () => {
        const key = `scan_${Date.now()}_${Math.random()}`;

        sessionStorage.setItem(key, JSON.stringify(select_print));
        window.open(`/print/karigar?key=${key}`, "_blank");
    }
    const categoryOptions = [
        {
            value: "",
            label: "All Category"
        },
        ...categories.map(item => ({
            value: item.id,
            label: item.name
        }))
    ];

    const colorOptions = [
        {
            value: "",
            label: "All Colors"
        },
        ...colors.map(item => ({
            value: item.id,
            label: item.name
        }))
    ];

    const karigarOptions = [
        {
            value: "",
            label: "All Karigar"
        },
        ...karigars.map(item => ({
            value: item.id,
            label: item.name
        }))
    ];
    const dajSelectStyle = {
        control: (base, state) => ({
            ...base,
            minHeight: "44px",
            borderRadius: "8px",
            borderColor: state.isFocused
                ? "var(--primary-color)"
                : "var(--border-color)",
            boxShadow: "none",
            backgroundColor: "var(--white-color)",
            "&:hover": {
                borderColor: "var(--primary-color)",
            },
        }),

        menu: (base) => ({
            ...base,
            zIndex: 9999,
        }),

        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected
                ? "var(--primary-color)"
                : state.isFocused
                    ? "var(--primary-light-color)"
                    : "var(--white-color)",
            color: state.isSelected
                ? "var(--white-color)"
                : "var(--text-color)",
            cursor: "pointer",
        }),

        singleValue: (base) => ({
            ...base,
            color: "var(--text-color)",
        }),

        placeholder: (base) => ({
            ...base,
            color: "var(--text-light-color)",
        }),
    };

    //*********************Table*************************** *//

    const displayValue = (value) => {
        return value !== null &&
            value !== undefined &&
            value !== ""
            ? value
            : "-";
    };
    const columns = [
        // ...(print_opt
        //     ? [
        //         {
        //             name: "Print",
        //             cell: (row) => {
        //                 const checked = select_print.some(
        //                     (item) => item.id === row.id
        //                 );

        //                 return (
        //                     <input
        //                         type="checkbox"
        //                         checked={checked}
        //                         readOnly
        //                         onClick={() => handle_print(row)}
        //                     />
        //                 );
        //             },
        //             width: "80px",
        //         },
        //     ]
        //     : []),

        {
            name: "SKU",
            selector: row => displayValue(row.sku),
            // sortable: true,
            minWidth: "150px",
            center: true,
        },

        {
            name: "Image",
            cell: row => (
                <img
                    src={row.image}
                    alt=""
                    className="daj-product-img"
                />
            ),
            width: "90px",
            center: true,
        },

        {
            name: "Category",
            selector: row =>
                categories.find(c => c.id == row.category_id)?.name || "-",
            center: true,
        },

        {
            name: "Color",
            selector: row =>
                colors.find(c => c.id == row.color_id)?.name || "-",
            center: true,
        },

        {
            name: "Polish",
            selector: row =>
                polish_array.find(p => p.id == row.polish_id)?.name || "White",
            center: true,
        },

        {
            name: "Code",
            selector: row => displayValue(row.code),
            center: true,
        },

        {
            name: "Design No",
            selector: row => displayValue(row.design_no),
            minWidth: "120px",
            center: true,
        },

        {
            name: "Updated",
            selector: row => formatDateTime(row.updated_at),
            minWidth: "200px",
            center: true,

        },

        {
            name: "Quantity",
            selector: row => row.ready_quantity,
            selector: row => displayValue(row.ready_quantity),
            center: true,
        },

        {
            name: "Note",
            selector: row =>
                displayValue((row.note || "") + (row.size || "")),
            center: true,
        },

        {
            name: "Box",
            selector: row => displayValue(row.box_name),
            center: true,
        },

        ...(userData.user.role !== "karigar"
            ? [
                {
                    name: "Action",
                    cell: row => (
                        <Link
                            className="daj-edit-btn"
                            to={`/products/edit/${row.id}`}
                            state={{
                                category: row.category_id,
                                karigar: row.karigar_id,
                                PR: row.production_run,
                            }}
                        >
                            <FaEdit size={18} />
                        </Link>
                    ),
                    width: "120px",
                    center: true,
                },
            ]
            : []),
    ];

    const customStyles = {

        headRow: {
            style: {
                backgroundColor: "var(--primary-color)",
                color: "#fff",
                fontWeight: 600,
                minHeight: "56px",
                fontFamily: "var(--title-font-family)",
                fontSize: "14px",
            },
        },

        rows: {
            style: {
                minHeight: "70px",
            },
        },
        cells: {
            style: {
                color: "var(--text-color)",
                fontSize: "14px",
                display: "flex",
            },
        },

        pagination: {
            style: {
                borderTop: "1px solid var(--border-color)",
            },
        },

    };

    return (
        <div className="daj-product-list-content">

            <div className="daj-product-list-header">

                <h2 className="daj-product-list-header-txt">
                    Products
                </h2>

                {/* Filters */}

                <div className="daj-product-filter-row">

                    <div className="daj-search-input">

                        <input
                            className="daj-product-search-inp"
                            placeholder="Search Product"
                            value={search_val}
                            onChange={(e) => setsearch_val(e.target.value)}
                        />

                        <button
                            className="daj-search-icon-btn"
                            onClick={() => setsearch_btn(!search_btn)}

                        >
                            <FiSearch size={18} />
                        </button>

                    </div>

                    <div className="daj-search-input">

                        <input
                            className="daj-product-search-inp"
                            placeholder="Product Code"
                            value={p_code}
                            onChange={(e) => setp_code(e.target.value)}
                        />

                        <button
                            className="daj-search-icon-btn"
                            onClick={() => setsearch_btn(!search_btn)}

                        >
                            <FiSearch size={18} />
                        </button>

                    </div>

                    {
                        userData.user.role !== "karigar" &&
                        karigars.length > 0 && (
                            <Select
                                className="daj-react-select"
                                styles={dajSelectStyle}
                                options={karigarOptions}
                                value={karigarOptions.find(
                                    (item) => item.value === karigar_filter
                                )}
                                onChange={(e) =>
                                    setkarigar_filter(e.value)
                                }
                            />
                        )
                    }

                    {
                        categories.length > 0 && (
                            <Select
                                className="daj-react-select"
                                styles={dajSelectStyle}
                                options={categoryOptions}
                                value={categoryOptions.find(
                                    (item) => item.value === category_filter
                                )}
                                onChange={(e) =>
                                    setcategory_filter(e.value)
                                }
                            />
                        )
                    }

                    {
                        colors.length > 0 && (
                            <Select
                                className="daj-react-select"
                                styles={dajSelectStyle}
                                options={colorOptions}
                                value={colorOptions.find(
                                    (item) => item.value === color_filter
                                )}
                                onChange={(e) =>
                                    setcolor_filter(e.value)
                                }
                            />
                        )
                    }

                </div>

                {/* Actions */}

                {
                    userData.user.role !== "karigar" && (

                        <div className="daj-product-action-row">

                            <Link
                                to="/products/create"
                                className="daj-add-product-btn"
                            >
                                Add Product
                            </Link>

                            {/* <button
                                className={`daj-select-print-btn ${print_opt
                                    ? "daj-select-print-btn-active"
                                    : ""
                                    }`}
                                onClick={() => {
                                    setprint_opt(!print_opt);
                                    setselect_print([]);
                                }}
                            >
                                Select for Print
                            </button>
                            <button
                                className="daj-print-btn"
                                onClick={print_selected}
                            >
                                Print List
                            </button> */}

                            {
                                print_opt && (
                                    <button
                                        className="daj-print-btn"
                                        onClick={print_selected}
                                    >
                                        Print List
                                    </button>
                                )
                            }

                        </div>

                    )
                }

            </div>

            <div className="daj-product-list-body">
                <div className="daj-table-wrapper">
                    <DataTable
                        columns={columns}
                        data={products}
                        customStyles={customStyles}
                        pagination

                        highlightOnHover
                        striped
                        persistTableHead
                        progressPending={loading}
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
                {/* {loading &&
                    <div className="daj-product-not-found">
                        Loading .....
                    </div>
                }

                {products.length === 0 && !loading &&
                    <div className="daj-product-not-found">
                        No products found.
                    </div>
                } */}
            </div>
        </div >
    );
}

export default ProductList;