import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Link } from "react-router-dom";
import "./AllProduct.scss"
import { useSelector } from "react-redux";

const AllProducts = () => {
    const [products, setProducts] = useState([]);
    const [search_val, setsearch_val] = useState('');
    const [search_btn, setsearch_btn] = useState(true);
    const [karigar_filter, setkarigar_filter] = useState('');
    const [category_filter, setcategory_filter] = useState('');
    const [quantity_filter, setquantity_filter] = useState('');
    const [status_filter, setstatus_filter] = useState('');
    const [loading, setloading] = useState(false);

    const workTypes = useSelector(state => state.workTypes.list);
    const karigars = useSelector(state => state.karigars.list);
    const categories = useSelector(state => state.category.list);
    const quantity_status = ['ready', 'casting', 'process', 'sold']

    useEffect(() => {
        fetchProducts();
    }, [karigar_filter, status_filter, search_btn, quantity_filter, category_filter]);

    const fetchProducts = async () => {
        setloading(true);

        try {
            const formData = new FormData();
            formData.append("search", search_val);
            formData.append("karigar_id", karigar_filter);
            formData.append("quantity_status", quantity_filter);
            formData.append("category_id", category_filter);
            formData.append("current_stage", status_filter);
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
                        {karigars?.length > 0 &&
                            <select className="daj-karigar-search" value={karigar_filter} onChange={(e) => setkarigar_filter(e.target.value)}>
                                <option value={''}>All</option>
                                {karigars.map((k_data, index) => {
                                    return (
                                        <option value={k_data.id} key={index}>{k_data.name}</option>
                                    );
                                })}
                            </select>
                        }
                        {categories?.length > 0 &&
                            <select className="daj-karigar-search" value={category_filter} onChange={(e) => setcategory_filter(e.target.value)}>
                                <option value={''}>All</option>
                                {categories.map((k_data, index) => {
                                    return (
                                        <option value={k_data.id} key={index}>{k_data.name}</option>
                                    );
                                })}
                            </select>
                        }
                        <select className="daj-karigar-search" value={quantity_filter} onChange={(e) => setquantity_filter(e.target.value)}>
                            <option value={''}>All</option>
                            {quantity_status.map((q_data, index) => {
                                return (
                                    <option value={q_data} key={index}>{q_data}</option>
                                );
                            })}
                        </select>
                        {workTypes?.length > 0 &&
                            <select className="daj-karigar-search" value={status_filter} onChange={(e) => setstatus_filter(e.target.value)}>
                                <option value={''}>All</option>
                                <option value={0}>office</option>
                                {workTypes.map((k_data, index) => {
                                    return (
                                        <option value={k_data.id} key={index}>{k_data.work_name}</option>
                                    );
                                })}
                                {/* <option value={4}>Complete</option> */}
                            </select>
                        }
                    </div>
                    <Link to="/products/create" className="daj-add-product-btn"> Add Product </Link>
                </div>
            </div>

            <div className="daj-product-list-body">
                <table className="daj-product-table">
                    <thead className="daj-product-table-head">
                        <tr>
                            <th className="p-3">SKU</th>
                            <th className="p-3">Image</th>
                            <th className="p-3">Category</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Stage</th>
                            <th className="p-3">Karigar</th>
                            <th className="p-3">PR</th>
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
                            let stage = 'office';
                            let karigar = '-';
                            var category = '-';

                            let idx = workTypes.findIndex((wt) => wt.id == p.current_stage);
                            if (idx > -1) {
                                stage = workTypes[idx].work_name;
                            }

                            // let K_idx = karigars.findIndex((kg) => kg.id == p.current_karigar_id);
                            // if (K_idx > -1) {
                            //     karigar = karigars[K_idx].name;
                            // }

                            let c_idx = categories.findIndex((kg) => kg.id == p.category_id);

                            if (c_idx > -1) {
                                category = categories[c_idx].name;
                            }

                            return (
                                <tr className="border-t" key={index}>
                                    <td className="p-3">{p.sku + "-" + p.production_run}</td>
                                    <td className="daj-table-img-shell">
                                        <img className="daj-product-img" src={p.image} />
                                    </td>
                                    <td className="p-3">{category}</td>
                                    <td className="p-3">{p.status}</td>
                                    <td className="p-3">{stage}</td>
                                    <td className="p-3">{p.current_karigar_id ? p.current_karigar_id : '-'}</td>
                                    <td className="p-3">{p.production_run}</td>
                                    <td className="p-3">{p.customer_name}</td>
                                    <td className="p-3">{formatDateTime(p.updated_at)}</td>
                                    <td className="p-3">{(p.net_weight_with_margin.toFixed(2) + 0) || "-"}</td>
                                    <td className="p-3">{p.gross_weight || "-"}</td>
                                    <td className="p-3">₹ {(Math.round((p.total_labour_with_margin) / 10) * 10)}</td>
                                    <td className="p-3">{p?.casting_box_name}</td>
                                    <td className="p-3">{p?.final_box_name}</td>
                                    <td className="p-3">
                                        <div className="daj-table-action-shell">
                                            <Link to={`/products/view/${p.id}`} className="daj-table-action" > View </Link>
                                            {/* <Link to={`/products/edit/${p.id}`} className="daj-table-action" > Edit </Link> */}
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>

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

export default AllProducts;