import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./Catalog.scss"
import { useSelector } from "react-redux";

const Catalog = () => {
    const [products, setProducts] = useState([]);
    const [search_val, setsearch_val] = useState('');
    const [search_btn, setsearch_btn] = useState(true);
    const [category_filter, setcategory_filter] = useState('');
    const [type_filter, settype_filter] = useState('polki');
    const [selection, setselection] = useState([]);
    const [loading, setloading] = useState(false);
    const [select_all, setselect_all] = useState(false);

    const categories = useSelector(state => state.category.list);

    useEffect(() => {
        fetchProducts();
    }, [search_btn, category_filter, type_filter]);

    const shareSelectedImages = async () => {

        try {
            if (!selection.length) {
                alert("Please select products");
                return;
            }

            const files = [];

            for (let checkbox of selection) {

                const imgUrl = checkbox.image;

                const res = await fetch(imgUrl);
                const blob = await res.blob();

                const img = await createImageBitmap(blob);

                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                canvas.width = img.width;
                canvas.height = img.height + 80;

                ctx.drawImage(img, 0, 0);

                // background for text
                ctx.fillStyle = "white";
                ctx.fillRect(0, img.height, canvas.width, 80);

                // text
                ctx.fillStyle = "black";
                ctx.font = "28px Arial";

                const sku = checkbox.sku;
                if (checkbox?.type == "AD") {
                    var lp = checkbox.total_labour;
                    var net = checkbox.net_weight.toFixed(2);
                    ctx.fillText("Weight: " + net, 500, img.height + 40);
                } else {
                    var lp = (Math.round((checkbox.total_labour_with_margin) / 10) * 10);
                    var net = checkbox.net_weight_with_margin.toFixed(2);
                    ctx.fillText("Net: " + net, 500, img.height + 40);
                }

                ctx.fillText("SKU: " + sku, 20, img.height + 40);
                ctx.fillText("LP: " + lp, 250, img.height + 40);

                const newBlob = await new Promise(resolve =>
                    canvas.toBlob(resolve, "image/jpeg", 0.95)
                );

                const file = new File(
                    [newBlob],
                    imgUrl.split("/").pop(),
                    { type: "image/jpeg" }
                );

                files.push(file);

            }

            if (navigator.canShare && navigator.canShare({ files })) {

                await navigator.share({
                    files,
                    title: "Jewellery Catalog"
                });

            }

        } catch (err) {

            console.error(err);
            alert("Share failed");

        }

    };

    const fetchProducts = async () => {
        setloading(true);

        try {
            const formData = new FormData();
            formData.append("search", search_val);
            formData.append("quantity_status", 'ready');
            formData.append("status", 'completed');
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

    const handleSelect = (data) => {
        let old_array = [...selection];
        let index = old_array.findIndex((p_data) => p_data?.id == data?.id);
        if (index > -1) {
            old_array.splice(index, 1);
        } else {
            old_array.push(data);
        }

        setselection(old_array);
    }

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            setsearch_btn(!search_btn)
        }
    };

    const print_selected = () => {
        const key = `scan_${Date.now()}_${Math.random()}`;

        sessionStorage.setItem(key, JSON.stringify(selection));
        window.open(`/print/catalog?key=${key}`, "_blank");
    }

    const select_all_product = () => {
        if (select_all) {
            setselection([]);
        } else {
            setselection(products);
        }

        setselect_all(!select_all);
    }

    return (
        <div className="daj-product-catalog-content">
            <div className="daj-product-list-header">
                <h2 className="daj-product-list-header-txt">Products</h2>
                <div className="daj-product-list-header-con">
                    <div className="daj-product-search-con">
                        <div className="daj-product-search-bar">
                            <input className="daj-product-search-inp" type="search" onKeyDown={(e) => handleKeyDown(e)} value={search_val} placeholder="Search bar" onChange={(e) => setsearch_val(e.target.value)} />
                            <span className="daj-product-search-btn" onClick={() => { setsearch_btn(!search_btn) }}>{'>'}</span>
                        </div>
                        {categories?.length > 0 &&
                            <select className="daj-catalog-category-filter" value={category_filter} onChange={(e) => setcategory_filter(e.target.value)}>
                                <option value={''}>All</option>
                                {categories.map((k_data, index) => {
                                    return (
                                        <option value={k_data.id} key={index}>{k_data.name}</option>
                                    );
                                })}
                            </select>
                        }
                        <select className="daj-catalog-type-filter" value={type_filter} onChange={(e) => settype_filter(e.target.value)}>
                            <option value={''}>All Type</option>
                            <option value={'polki'}>Monzonite Jewellery</option>
                            <option value={'AD'}>AD jewellery</option>
                        </select>
                        <button className="daj-catalog-select-all" onClick={() => { select_all_product() }}>{select_all ? 'UnSelect All' : 'Select All'}</button>
                    </div>
                </div>
            </div>
            <div className="daj-share-catalog-act">
                <button className="daj-share-catalog-btn" onClick={() => shareSelectedImages()}>Share Selected</button>
                <button className="daj-share-catalog-btn" onClick={() => print_selected()}>Print Selected</button>
            </div>
            <div className="daj-product-list-body">
                {products.length > 0 && products.map((p, index) => {
                    let idx = selection.findIndex((data) => data?.id == p?.id);
                    return (
                        <div className="daj-catalog-product-outer" onClick={() => handleSelect(p)} key={index}>
                            <input type="checkbox" className='daj-catalog-select' checked={(idx > -1)} value={p.image} readOnly />
                            <div className="daj-catalog-product-image">
                                <img className="daj-product-img" src={p.image} draggable />
                            </div>
                            <div className="daj-catalog-product-data">
                                <span className="daj-catalog-product-info">SKU : {p.sku + "-" + p.production_run}</span>
                                {p.type == "AD" ?
                                    <>
                                        <span className="daj-catalog-product-info">LBR : {(Math.round((p.total_labour) / 10) * 10)}</span>
                                        <span className="daj-catalog-product-info">Weight : {Number(p?.net_weight)?.toFixed(2) || "-"}</span>
                                    </>
                                    :
                                    <>
                                        <span className="daj-catalog-product-info">LP : {(Math.round((p.total_labour_with_margin) / 10) * 10)}</span>
                                        <span className="daj-catalog-product-info">Net : {p.net_weight_with_margin.toFixed(2) || "-"}</span>
                                    </>
                                }
                            </div>
                        </div>
                    );
                })}
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
        </div>
    );
}

export default Catalog;