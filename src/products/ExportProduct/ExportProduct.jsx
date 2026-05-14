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
                let design_no = product?.design_no ? 'D:' + product?.design_no : '';

                let new_obj = {
                    "id": product?.id,
                    "sku": product?.sku,
                    "copies": 1,
                    "code": 'SP-' + product?.code,
                    "box_name": box_name,
                    "design_no": design_no,
                    "copies": product?.r_quantity,
                }

                product_array.push(new_obj);
            })
        }

        const formData = new FormData();
        formData.append("product_array", JSON.stringify(product_array));

        const res = await api.post("/label/print-list.php", formData);
    }

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
                                <th className="p-3">Code</th>
                                <th className="p-3">Color</th>
                                <th className="p-3">Polish</th>
                                <th className="p-3">Update</th>
                                <th className="p-3">Quantity</th>
                                {/* <th className="p-3">Action</th> */}
                            </tr>
                        </thead>
                        <tbody className="daj-product-table-body">
                            {products.length > 0 && products.map((p, index) => {
                                var idx = selection.findIndex((data) => data?.id == p?.id);
                                var color = '-';
                                var polish = '-';

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

                                return (
                                    <tr className="border-t" key={index}>
                                        <td className="p-3" style={{ cursor: 'pointer' }} onClick={() => handleSelect(p)}>
                                            <input type="checkbox" checked={(idx > -1)} readOnly />
                                        </td>
                                        <td className="p-3">{p.sku}</td>
                                        <td className="daj-table-img-shell">
                                            <img className="daj-product-img" src={p.image} />
                                        </td>
                                        <td className="p-3">{p.code}</td>
                                        <td className="p-3">{color}</td>
                                        <td className="p-3">{polish}</td>
                                        <td className="p-3">{formatDateTime(p.updated_at)}</td>
                                        <td className="p-3">
                                            <input type="number" max={p?.ready_quantity} min={1} value={p?.r_quantity ? p?.r_quantity : 1} onChange={(e) => { handle_quantity(p?.id, e.target.value) }} onBlur={() => { update_selection(p?.id) }} />
                                            <span>{' / ' + (p?.ready_quantity)}</span>
                                        </td>
                                        {/* <td className="p-3">
                                            <div className="daj-table-action-shell">
                                                <Link to={`/products/view/${p.id}`} className="daj-table-action" > View </Link>
                                            </div>
                                        </td> */}
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
                                    <th className="p-3">Code</th>
                                    <th className="p-3">Color</th>
                                    <th className="p-3">Polish</th>
                                    <th className="p-3">Design_no</th>
                                    <th className="p-3">Quantity</th>
                                    {/* <th className="p-3">Customer Name</th> */}
                                    <th className="p-3">Action</th>
                                </tr>
                            </thead>
                            <tbody className="daj-product-table-body">
                                {selection.length > 0 && selection.map((p, index) => {

                                    var color = '-';
                                    var polish = '-';

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

                                    return (
                                        <tr className="border-t" key={index}>
                                            <td className="p-3">{p.sku + '-' + p.production_run}</td>
                                            <td className="daj-table-img-shell">
                                                <img className="daj-product-img" src={p.image} />
                                            </td>
                                            <td className="p-3">{p?.code}</td>
                                            <td className="p-3">{color}</td>
                                            <td className="p-3">{polish}</td>
                                            <td className="p-3">{p?.design_no}</td>
                                            <td className="p-3">{(p?.r_quantity ? p.r_quantity : 1)}</td>
                                            {/* <td className="p-3">
                                                <div className="daj-table-action-shell">
                                                    <Link to={`/products/view/${p.id}`} className="daj-table-action" > View </Link>
                                                </div>
                                            </td> */}
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
                                <button className="daj-print-export" onClick={() => { print_label() }}> Label Print </button>
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