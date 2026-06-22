import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./ProductList.scss"
import { useSelector } from "react-redux";

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

    const print_selected = () => {
        const key = `scan_${Date.now()}_${Math.random()}`;

        sessionStorage.setItem(key, JSON.stringify(select_print));
        window.open(`/print/karigar?key=${key}`, "_blank");
    }

    return (
        <div className="daj-product-list-content">
            <div className="daj-product-list-header">
                <h2 className="daj-product-list-header-txt">Products</h2>
                <div className="daj-product-list-header-con">
                    <div className="daj-product-search-con">
                        <div className="daj-product-search-bar">
                            <input className="daj-product-search-inp" type="search" onKeyDown={(e) => handleKeyDown(e)} value={search_val} placeholder="Search bar" onChange={(e) => setsearch_val(e.target.value)} />
                            <input className="daj-product-search-inp" type="search" onKeyDown={(e) => handleKeyDown(e)} value={p_code} placeholder="Product Code" onChange={(e) => setp_code(e.target.value)} />
                            <span className="daj-product-search-btn" onClick={() => { setsearch_btn(!search_btn) }}>{'>'}</span>
                        </div>
                        {userData.user.role != 'karigar' && karigars?.length > 0 &&
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
                            <select className="daj-karigar-search" value={color_filter} onChange={(e) => setcolor_filter(e.target.value)}>
                                <option value={''}>All Colors</option>
                                {colors.map((k_data, index) => {
                                    return (
                                        <option value={k_data.id} key={index}>{k_data.name}</option>
                                    );
                                })}
                            </select>
                        }
                        {print_opt &&
                            <button className="daj-karigar-print-btn" onClick={() => print_selected()}>Print List</button>
                        }
                    </div>
                    {userData.user.role != 'karigar' &&
                        <div className="daj-process-list-action">
                            <Link to="/products/create" className="daj-add-product-btn"> Add Product </Link>
                            <button className={`daj-select-print-product ${print_opt ? 'daj-print-select-act' : ''} `} onClick={() => { setprint_opt(!print_opt); setselect_print([]); }}> Select for Print </button>
                        </div>
                    }
                </div>
            </div>

            <div className="daj-product-list-body">
                <table className="daj-product-table">
                    <thead className="daj-product-table-head">
                        <tr>
                            {print_opt &&
                                <th className="p-3">Print</th>
                            }
                            <th className="p-3">SKU</th>
                            <th className="p-3">Image</th>
                            <th className="p-3">Category</th>
                            <th className="p-3">Color</th>
                            <th className="p-3">Polish</th>
                            <th className="p-3">Code</th>
                            <th className="p-3">Design No</th>
                            <th className="p-3" onClick={() => { settime_order(!time_order) }}>
                                <div className="daj-table-header-cell">
                                    <span>Update</span>
                                    <svg className={`daj-product-order-icon ${time_order ? 'daj-active-icon' : ''}`} xmlns="http://www.w3.org/2000/svg" width="13" height="16" viewBox="0 0 13 16" fill="none">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M5.82429 8.26285C5.41716 8.63604 5.38966 9.2686 5.76285 9.67573L11.2628 15.6758C11.636 16.0829 12.2686 16.1104 12.6757 15.7373C13.0828 15.3641 13.1104 14.7315 12.7372 14.3244L7.23717 8.32429C6.86398 7.91717 6.23141 7.88966 5.82429 8.26285Z" fill="black" />
                                        <path fillRule="evenodd" clipRule="evenodd" d="M0.324077 15.7336C0.731092 16.1069 1.36367 16.0796 1.73697 15.6726L7.23697 9.67593C7.61028 9.26892 7.58295 8.63634 7.17593 8.26304C6.76892 7.88973 6.13634 7.91706 5.76304 8.32408L0.263039 14.3207C-0.110267 14.7278 -0.0829389 15.3603 0.324077 15.7336Z" fill="black" />
                                        <path fillRule="evenodd" clipRule="evenodd" d="M5.82429 0.262847C5.41716 0.636036 5.38966 1.2686 5.76285 1.67573L11.2628 7.67581C11.636 8.08294 12.2686 8.11044 12.6757 7.73725C13.0828 7.36407 13.1104 6.7315 12.7372 6.32438L7.23717 0.324287C6.86398 -0.082835 6.23141 -0.110343 5.82429 0.262847Z" fill="black" />
                                        <path fillRule="evenodd" clipRule="evenodd" d="M0.324077 7.73364C0.731092 8.10694 1.36367 8.07961 1.73697 7.6726L7.23697 1.67593C7.61028 1.26892 7.58295 0.636344 7.17593 0.263039C6.76892 -0.110266 6.13634 -0.0829383 5.76304 0.324077L0.263039 6.32074C-0.110267 6.72776 -0.0829389 7.36033 0.324077 7.73364Z" fill="black" />
                                    </svg>
                                </div>
                            </th>
                            <th className="p-3">Quantity</th>
                            <th className="p-3">Note</th>
                            <th className="p-3">Box</th>
                            {userData.user.role != 'karigar' &&
                                <th className="p-3">Action</th>
                            }
                        </tr>
                    </thead>
                    <tbody className="daj-product-table-body">
                        {products.length > 0 && products.map((p, index) => {
                            let stage = 'office';
                            var print_select = false;
                            var category = '-';
                            var color = '-';
                            var polish = '-';
                            var count = 0;

                            let c_idx = categories.findIndex((kg) => kg.id == p.category_id);
                            if (c_idx > -1) {
                                category = categories[c_idx]?.name;
                            }


                            let clr_idx = colors.findIndex((kg) => kg.id == p.color_id);
                            if (clr_idx > -1) {
                                color = colors[clr_idx]?.name;
                            }

                            let pls_idx = polish_array.findIndex((kg) => kg.id == p.polish_id);
                            if (pls_idx > -1) {
                                polish = polish_array[pls_idx]?.name;
                            } else {
                                polish = "White";
                            }

                            let p_idx = select_print.findIndex((p_data) => p_data?.id == p?.id);
                            if (p_idx > -1) {
                                print_select = true;
                            }

                            return (
                                <tr className="border-t" key={index}>
                                    {print_opt &&
                                        <td className="p-3" onClick={() => handle_print(p)}>
                                            <input type="checkbox" checked={print_select} readOnly />
                                        </td>
                                    }
                                    <td className="p-3">{p.sku}</td>
                                    <td className="daj-table-img-shell">
                                        <img className="daj-product-img" src={p.image} />
                                    </td>
                                    <td className="p-3">{category}</td>
                                    <td className="p-3">{color}</td>
                                    <td className="p-3">{polish}</td>
                                    <td className="p-3">{p.code}</td>
                                    <td className="p-3">{p.design_no}</td>
                                    <td className="p-3" style={{ background: `rgb(255 0 0 / ${count}%)` }}>{formatDateTime(p.updated_at)}</td>
                                    <td className="p-3">{p?.ready_quantity}</td>
                                    <td className="p-3">{(p?.note ? p.note : '') + (p?.size ? p.size : '')}</td>
                                    <td className="p-3">{p?.box_name}</td>
                                    {userData.user.role != 'karigar' &&
                                        <td className="p-3">
                                            <div className="daj-table-action-shell">
                                                <Link to={`/products/edit/${p.id}`} className="daj-table-action" state={{ 'category': p.category_id, 'karigar': p.karigar_id, 'PR': p.production_run }}> Edit </Link>
                                            </div>
                                        </td>
                                    }
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

export default ProductList;