import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./Catalog.scss"
import { useSelector } from "react-redux";

const Catalog = () => {
    const [products, setProducts] = useState([]);
    const [search_val, setsearch_val] = useState('');
    const [search_btn, setsearch_btn] = useState(true);
    const [category_filter, setcategory_filter] = useState('');
    const [color_filter, setcolor_filter] = useState('');
    const [type_filter, settype_filter] = useState('polki');
    const [selection, setselection] = useState([]);
    const [loading, setloading] = useState(false);
    const [select_all, setselect_all] = useState(false);

    const categories = useSelector(state => state.category.list);
    const colors = useSelector(state => state.colors.list);

    useEffect(() => {
        fetchProducts();
    }, [search_btn, category_filter, color_filter]);

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

                // Dynamic values
                const fontSize = Math.max(28, img.width * 0.03);
                const padding = fontSize * 2;

                canvas.width = img.width;
                canvas.height = img.height + padding;

                ctx.drawImage(img, 0, 0);

                // Bottom white background
                ctx.fillStyle = "white";
                ctx.fillRect(0, img.height, canvas.width, padding);

                // Text styling
                ctx.fillStyle = "black";
                ctx.font = `${fontSize}px Arial`;

                const sku = checkbox.sku;
                const lp = checkbox.code;
                const net = checkbox.design_no;

                // Dynamic text positions
                ctx.fillText(`SKU: ${sku}`, img.width * 0.03, img.height + fontSize + 5);
                ctx.fillText(`Code: ${lp}`, img.width * 0.35, img.height + fontSize + 5);
                ctx.fillText(`Ds_no: ${net}`, img.width * 0.65, img.height + fontSize + 5);

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
                                <option value={''}>All Category</option>
                                {categories.map((k_data, index) => {
                                    return (
                                        <option value={k_data.id} key={index}>{k_data.name}</option>
                                    );
                                })}
                            </select>
                        }
                        {colors?.length > 0 &&
                            <select className="daj-catalog-category-filter" value={color_filter} onChange={(e) => setcolor_filter(e.target.value)}>
                                <option value={''}>All Colors</option>
                                {colors.map((k_data, index) => {
                                    return (
                                        <option value={k_data.id} key={index}>{k_data.name}</option>
                                    );
                                })}
                            </select>
                        }
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
                                <span className="daj-catalog-product-info">SKU : {p.sku}</span>
                                <span className="daj-catalog-product-info">SP : {p.code}</span>
                                <span className="daj-catalog-product-info">Design No : {p.design_no}</span>
                                <span className="daj-catalog-product-info">Box : {p.box_name}</span>
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