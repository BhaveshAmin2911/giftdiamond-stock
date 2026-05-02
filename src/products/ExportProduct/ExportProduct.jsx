import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Link, useNavigate } from "react-router-dom";
import "./ExportProduct.scss"
import { useSelector } from "react-redux";

const ExportProduct = () => {
    const [products, setProducts] = useState([]);
    const [search_val, setsearch_val] = useState('');
    const [search_btn, setsearch_btn] = useState(true);
    const [karigar_filter, setkarigar_filter] = useState('');
    const [status_filter, setstatus_filter] = useState('');
    const [product_filter, setproduct_filter] = useState('normal');
    const [category_filter, setcategory_filter] = useState('');
    const [type_filter, settype_filter] = useState('polki');
    const [selection, setselection] = useState([]);
    const [ad_selection, setad_selection] = useState([]);
    const [loading, setloading] = useState(false);

    const navigate = useNavigate();

    const workTypes = useSelector(state => state.workTypes.list);
    const karigars = useSelector(state => state.karigars.list);
    const categories = useSelector(state => state.category.list);

    useEffect(() => {
        fetchProducts();
    }, [search_btn, category_filter, type_filter]);

    const fetchProducts = async () => {
        setloading(true);

        try {
            const formData = new FormData();
            formData.append("search", search_val);
            // formData.append("karigar_id", karigar_filter);
            // formData.append("current_stage", status_filter);
            formData.append("quantity_status", 'ready');
            formData.append("status", 'completed');
            // formData.append("production_run", '1');
            formData.append("category_id", category_filter);
            formData.append("product_type", type_filter);
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
        if (type_filter == 'AD') {
            var old_array = [...ad_selection];
        } else {
            var old_array = [...selection];
        }

        let index = old_array.findIndex((p_data) => p_data?.id == data?.id);
        if (index > -1) {
            old_array.splice(index, 1);
        } else {
            old_array.push(data);
        }

        if (type_filter == 'AD') {
            setad_selection(old_array);
        } else {
            setselection(old_array);
        }
    }

    const submit_selection = async () => {

        let id_array = selection.map(pr => pr.id)
        const key = `scan_${Date.now()}_${Math.random()}`;
        sessionStorage.setItem(key, JSON.stringify(id_array));
        window.open(`/print/order?key=${key}`, "_blank");
    }

    const Sell_data = () => {
        let id_array = selection.map(pr => pr.id);

        const key = `scan_${Date.now()}_${Math.random()}`;
        sessionStorage.setItem(key, JSON.stringify(id_array));
        window.open(`/generate/order?key=${key}`, "_blank");
    }

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            setsearch_btn(!search_btn)
        }
    };

    return (
        <div className="daj-product-list-content">
            <div className="daj-product-list-header">
                <h2 className="daj-product-list-header-txt">Products</h2>
                <div className="daj-product-list-header-con">
                    <div className="daj-product-search-con">
                        <div className="daj-product-search-bar">
                            <input className="daj-product-search-inp" type="search" onKeyDown={(e) => handleKeyDown(e)} value={search_val} placeholder="Search bar" onChange={(e) => setsearch_val(e.target.value)} />
                            <span className="daj-product-search-btn" onClick={() => { setsearch_btn(!search_btn) }}>{'>'}</span>
                        </div>
                        {categories?.length > 0 &&
                            <select className="daj-karigar-search" value={category_filter} onChange={(e) => setcategory_filter(e.target.value)}>
                                <option value={''}>All Category</option>
                                {categories.map((k_data, index) => {
                                    return (
                                        <option value={k_data.id} key={index}>{k_data.name}</option>
                                    );
                                })}
                            </select>
                        }
                        <select className="daj-karigar-search" value={type_filter} onChange={(e) => settype_filter(e.target.value)}>
                            <option value={''}>All Type</option>
                            <option value={'polki'}>Monzonite Jewellery</option>
                            <option value={'AD'}>AD jewellery</option>
                        </select>
                    </div>
                </div>
                <div className="daj-produt-switcher">
                    <div className="daj-produt-switcher-inner">
                        <button className={`daj-produt-switcher-btns ${product_filter == 'normal' ? 'daj-active-switcher' : ''}`} onClick={() => { setproduct_filter('normal') }}> All products </button>
                        <button className={`daj-produt-switcher-btns ${product_filter == 'selected' ? 'daj-active-switcher' : ''}`} onClick={() => { setproduct_filter('selected') }}> View Selection </button>
                    </div>
                </div>
            </div>

            <div className="daj-product-list-body">
                {product_filter == 'normal' &&
                    <table className="daj-product-table">
                        <thead className="daj-product-table-head">
                            <tr>
                                <th className="p-3">Select</th>
                                <th className="p-3">SKU</th>
                                <th className="p-3">Image</th>
                                <th className="p-3">Status</th>
                                {/* <th className="p-3">PR</th> */}
                                <th className="p-3">Customer Name</th>
                                <th className="p-3">Update</th>
                                <th className="p-3">Net Weight</th>
                                <th className="p-3">Gross Weight</th>
                                <th className="p-3">Making Cost</th>
                                <th className="p-3">Casting Box</th>
                                <th className="p-3">Final Box</th>
                                <th className="p-3">Action</th>
                            </tr>
                        </thead>
                        <tbody className="daj-product-table-body">
                            {products.length > 0 && products.map((p, index) => {
                                if (type_filter == "AD") {
                                    var idx = ad_selection.findIndex((data) => data?.id == p?.id);
                                } else {
                                    var idx = selection.findIndex((data) => data?.id == p?.id);
                                }
                                return (
                                    <tr className="border-t" key={index}>
                                        <td className="p-3" style={{ cursor: 'pointer' }} onClick={() => handleSelect(p)}>
                                            <input type="checkbox" checked={(idx > -1)} readOnly />
                                        </td>
                                        <td className="p-3">{p.sku + "-" + p.production_run}</td>
                                        <td className="daj-table-img-shell">
                                            <img className="daj-product-img" src={p.image} />
                                        </td>
                                        <td className="p-3">{p.status}</td>
                                        {/* <td className="p-3">{p.production_run}</td> */}
                                        <td className="p-3">{p.customer_name}</td>
                                        <td className="p-3">{formatDateTime(p.updated_at)}</td>
                                        <td className="p-3">{p.net_weight_with_margin.toFixed(2) || "-"}</td>
                                        <td className="p-3">{p.gross_weight || "-"}</td>
                                        {p.type == 'AD' ?
                                            <td className="p-3">₹ {(Math.round((p.total_labour) / 10) * 10)}</td>
                                            :
                                            <td className="p-3">₹ {(Math.round((p.total_labour_with_margin) / 10) * 10)}</td>
                                        }
                                        <td className="p-3">{p?.casting_box_name}</td>
                                        <td className="p-3">{p?.final_box_name}</td>
                                        <td className="p-3">
                                            <div className="daj-table-action-shell">
                                                <Link to={`/products/view/${p.id}`} className="daj-table-action" > View </Link>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                }
                {product_filter == 'selected' &&
                    <>
                        <table className="daj-product-table">
                            <thead className="daj-product-table-head">
                                <tr>
                                    <th className="p-3">SKU</th>
                                    <th className="p-3">Image</th>
                                    {/* <th className="p-3">PR</th> */}
                                    <th className="p-3">Customer Name</th>
                                    <th className="p-3">Net Weight</th>
                                    <th className="p-3">Gross Weight</th>
                                    <th className="p-3">Making Cost</th>
                                    <th className="p-3">Casting Box</th>
                                    <th className="p-3">Final Box</th>
                                    <th className="p-3">Action</th>
                                    <th className="p-3">Remove</th>
                                </tr>
                            </thead>
                            <tbody className="daj-product-table-body">
                                {[...selection, ...ad_selection].length > 0 && [...selection, ...ad_selection].map((p, index) => {
                                    return (
                                        <tr className="border-t" key={index}>
                                            <td className="p-3">{p.sku + '-' + p.production_run}</td>
                                            <td className="daj-table-img-shell">
                                                <img className="daj-product-img" src={p.image} />
                                            </td>
                                            {/* <td className="p-3">{p.production_run}</td> */}
                                            <td className="p-3">{p.customer_name}</td>
                                            <td className="p-3">{p.net_weight_with_margin.toFixed(2) || "-"}</td>
                                            <td className="p-3">{p.gross_weight || "-"}</td>
                                            <td className="p-3">₹ {(Math.round((p.total_labour_with_margin) / 10) * 10)}</td>
                                            <td className="p-3">{p?.casting_box_name}</td>
                                            <td className="p-3">{p?.final_box_name}</td>
                                            <td className="p-3">
                                                <div className="daj-table-action-shell">
                                                    <Link to={`/products/view/${p.id}`} className="daj-table-action" > View </Link>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="daj-table-action-shell">
                                                    <button className="daj-table-action" onClick={() => handleSelect(p)}> Remove </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>

                        {selection.length > 0 &&
                            <div className="daj-print-sell-export">
                                <button className="daj-print-export" onClick={() => { submit_selection() }}> Print </button>
                                <button className="daj-sell-export" onClick={() => { Sell_data() }}> Sell </button>
                            </div>
                        }
                    </>
                }

                {loading &&
                    <div className="daj-product-not-found">
                        Loading .....
                    </div>
                }

                {products.length === 0 && !loading &&
                    <div className="daj-product-not-found">
                        No products found.
                    </div>
                }
            </div>
        </div >
    );
}

export default ExportProduct;