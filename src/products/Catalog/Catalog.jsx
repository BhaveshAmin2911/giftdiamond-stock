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
    const [size_filter, setsize_filter] = useState('');
    const [type_filter, settype_filter] = useState('polki');
    const [selection, setselection] = useState([]);
    const [pagination_val, setpagination_val] = useState(1);
    const [current_page, setcurrent_page] = useState(1);
    const [total_page, settotal_page] = useState(0);
    const [loading, setloading] = useState(false);
    const [select_all, setselect_all] = useState(false);

    const categories = useSelector(state => state.category.list);
    const colors = useSelector(state => state.colors.list);
    const size = useSelector(state => state.size.list);

    useEffect(() => {
        fetchProducts();
    }, [search_btn, category_filter, color_filter, current_page, size_filter]);

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
                const design_no = checkbox.design_no;
                const size = checkbox.size;

                // Dynamic text positions
                ctx.fillText(`SKU: ${sku}`, img.width * 0.03, img.height + fontSize + 5);
                ctx.fillText(`Code: ${lp}`, img.width * 0.35, img.height + fontSize + 5);
                if (checkbox.category_id == 6) {
                    ctx.fillText(`size: ${size}`, img.width * 0.65, img.height + fontSize + 5);
                } else {
                    ctx.fillText(`Ds_no: ${design_no}`, img.width * 0.65, img.height + fontSize + 5);
                }

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

    const fetchProducts = async (page = 1) => {
        setloading(true);

        try {
            const formData = new FormData();
            formData.append("search", search_val);
            formData.append("quantity_status", 'ready');
            formData.append("category_id", category_filter);
            formData.append("color", color_filter);
            formData.append("size", size_filter);
            formData.append("per_page", 60);
            formData.append("current_page", page);

            const res = await api.post("/products/list.php", formData);
            if (res.data.status) {
                setProducts(res.data.data);
                settotal_page(res.data?.pagination?.total_pages)
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

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // Use 'instant' for immediate jumping without animation
        });
    }

    return (
        <div className="daj-product-catalog-content">
            <div className="daj-product-catalog-footer">
                <div className="daj-product-catalog-share">
                    <button className="daj-share-catalog-btn" onClick={() => shareSelectedImages()}>Share Selected</button>
                    <button className="daj-share-catalog-btn" onClick={() => print_selected()}>Print Selected</button>
                </div>
                <div className="daj-catalog-pagination">
                    <span>Page </span>
                    <input className="daj-catalog-pagination-val" type="number" max={total_page} min={1} value={pagination_val} onChange={(e) => setpagination_val(e.target.value)} />
                    <span> / {total_page}</span>
                    <button className="daj-catalog-pagination-btn" onClick={() => { scrollToTop(), fetchProducts(pagination_val) }}>{'Go'}</button>
                </div>
            </div>
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
                        {size?.length > 0 &&
                            <select className="daj-catalog-category-filter" value={size_filter} onChange={(e) => setsize_filter(e.target.value)}>
                                <option value={''}>All Size</option>
                                {size.map((s_data, index) => {
                                    return (
                                        <option value={s_data.id} key={index}>{s_data.size}</option>
                                    );
                                })}
                            </select>
                        }
                        <button className="daj-catalog-select-all" onClick={() => { select_all_product() }}>{select_all ? 'UnSelect All' : 'Select All'}</button>
                    </div>
                </div>
            </div>
            {/* <div className="daj-share-catalog-act">
                <button className="daj-share-catalog-btn" onClick={() => shareSelectedImages()}>Share Selected</button>
                <button className="daj-share-catalog-btn" onClick={() => print_selected()}>Print Selected</button>
            </div> */}
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
                                {p.category_id == 6 ?
                                    <span className="daj-catalog-product-info">Size : {p.size}</span>
                                    :
                                    <span className="daj-catalog-product-info">Design No : {p.design_no}</span>
                                }
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