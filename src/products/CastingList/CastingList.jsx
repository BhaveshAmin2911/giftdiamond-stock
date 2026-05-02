import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Link } from "react-router-dom";
import "./CastingList.scss"
import { useSelector } from "react-redux";

const CastingList = () => {
    const [products, setProducts] = useState([]);
    const [search_val, setsearch_val] = useState('');
    const [search_btn, setsearch_btn] = useState(true);
    const [category_filter, setcategory_filter] = useState('');
    const [loading, setloading] = useState(false);

    const categories = useSelector(state => state.category.list);

    useEffect(() => {
        fetchProducts();
    }, [search_btn, category_filter]);

    const fetchProducts = async () => {
        setloading(true);

        try {
            const formData = new FormData();
            formData.append("search", search_val);
            formData.append("category_id", category_filter);
            // formData.append("per_page", 300);

            const res = await api.post("/products/casting-stock.php", formData);
            if (res.data.status) {
                setProducts(res.data.data);
            }
        } catch (error) {
            console.error(error);
        }

        setloading(false);
    };

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
                                <option value={''}>All</option>
                                {categories.map((k_data, index) => {
                                    return (
                                        <option value={k_data.id} key={index}>{k_data.name}</option>
                                    );
                                })}
                            </select>
                        }
                        <Link to={'/casting/scan'} className="daj-scan-casting-btn">Scan & Send</Link>
                    </div>
                </div>
            </div>

            <div className="daj-product-list-body">
                <table className="daj-product-table">
                    <thead className="daj-product-table-head">
                        <tr>
                            <th className="p-3">SKU</th>
                            <th className="p-3">Image</th>
                            <th className="p-3">Category</th>
                            <th className="p-3">Net Weight</th>
                            <th className="p-3">Quantity</th>
                            <th className="p-3">Casting Box</th>
                            <th className="p-3">Action</th>
                        </tr>
                    </thead>
                    <tbody className="daj-product-table-body">
                        {products.length > 0 && products.map((p, index) => {

                            return (
                                <tr className="border-t" key={index}>
                                    <td className="p-3">{p.sku}</td>
                                    <td className="daj-table-img-shell">
                                        <img className="daj-product-img" src={p.image} />
                                    </td>
                                    <td className="p-3">{p.category}</td>
                                    <td className="p-3">{(p.total_casting_weight?.toFixed(2) + 0) || "-"}</td>
                                    <td className="p-3">{p.total_casting_quantity}</td>
                                    <td className="p-3">{p?.casting_box ? p.casting_box : '-'}</td>
                                    <td className="p-3">
                                        <div className="daj-table-action-shell">
                                            <Link to={`/edit/casting/${p.sku}`} className="daj-table-action" > Edit </Link>
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

export default CastingList;