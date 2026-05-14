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
    const [color_filter, setcolor_filter] = useState('');
    const [loading, setloading] = useState(false);

    const colors = useSelector(state => state.colors.list);
    const karigars = useSelector(state => state.karigars.list);
    const categories = useSelector(state => state.category.list);
    const quantity_status = ['ready', 'casting', 'process', 'sold']

    useEffect(() => {
        fetchProducts();
    }, [karigar_filter, color_filter, search_btn, quantity_filter, category_filter]);

    const fetchProducts = async () => {
        setloading(true);

        try {
            const formData = new FormData();
            formData.append("search", search_val);
            formData.append("karigar_id", karigar_filter);
            formData.append("quantity_status", quantity_filter);
            formData.append("category_id", category_filter);
            formData.append("color", color_filter);
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
                                <option value={''}>All Karigar</option>
                                {karigars.map((k_data, index) => {
                                    return (
                                        <option value={k_data.id} key={index}>{k_data.name}</option>
                                    );
                                })}
                            </select>
                        }
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
                        {colors?.length > 0 &&
                            <select className="daj-karigar-search" value={color_filter} onChange={(e) => setcolors_filter(e.target.value)}>
                                <option value={''}>All Color</option>
                                {colors.map((k_data, index) => {
                                    return (
                                        <option value={k_data.id} key={index}>{k_data.name}</option>
                                    );
                                })}
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
                            <th className="p-3">Karigar</th>
                            <th className="p-3">Customer Name</th>
                            <th className="p-3">Update</th>
                            <th className="p-3">Action</th>
                        </tr>
                    </thead>
                    <tbody className="daj-product-table-body">
                        {products.length > 0 && products.map((p, index) => {
                            let stage = 'office';
                            let karigar = '-';
                            var category = '-';

                            let c_idx = categories.findIndex((kg) => kg.id == p.category_id);

                            if (c_idx > -1) {
                                category = categories[c_idx].name;
                            }

                            return (
                                <tr className="border-t" key={index}>
                                    <td className="p-3">{p.sku}</td>
                                    <td className="daj-table-img-shell">
                                        <img className="daj-product-img" src={p.image} />
                                    </td>
                                    <td className="p-3">{category}</td>
                                    <td className="p-3">{p.karigar_id ? p.karigar_id : '-'}</td>
                                    <td className="p-3">{p.customer_name}</td>
                                    <td className="p-3">{formatDateTime(p.updated_at)}</td>
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