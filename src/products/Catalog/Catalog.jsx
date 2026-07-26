import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./Catalog.css"
import { useSelector } from "react-redux";
import Select from "react-select";
import { FiSearch } from "react-icons/fi";
import { SlShare } from "react-icons/sl";
import { SlPrinter } from "react-icons/sl";
import noDataImg from "../../assests/img/no-data-img.svg";
import { FaSpinner } from "react-icons/fa";
import { dajSelectStyle } from "../../Common/reactSelectStyles";


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
    const [popup, setpopup] = useState(false);
    const [popup_data, setpopup_data] = useState();

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
                console.log(checkbox);


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
                // const design_no = checkbox.design_no;
                const box = checkbox.box_name;
                const size = checkbox.size;

                // Dynamic text positions
                ctx.fillText(`SKU: ${sku}`, img.width * 0.03, img.height + fontSize + 5);
                if (checkbox.category_id == 6) {
                    ctx.fillText(`Code: ${lp + " / " + size}`, img.width * 0.35, img.height + fontSize + 5);
                    // ctx.fillText(`size: ${size}`, img.width * 0.65, img.height + fontSize + 5);
                } else {
                    ctx.fillText(`Code: ${lp}`, img.width * 0.35, img.height + fontSize + 5);
                }
                ctx.fillText(`Box: ${box}`, img.width * 0.65, img.height + fontSize + 5);

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

    const shareCombinedCatalog = async () => {

        let main_data = popup_data;
        let img_data = main_data.products;

        try {

            if (!img_data.length) {
                alert("Please select products");
                return;
            }

            const PRODUCTS_PER_PAGE = 9;
            const COLS = 3;
            const ROWS = 3;

            const CELL_WIDTH = 500;
            const CELL_HEIGHT = 500;

            // Bottom information bar height
            const INFO_BAR_HEIGHT = 60;

            const files = [];

            for (let page = 0; page < Math.ceil(img_data.length / PRODUCTS_PER_PAGE); page++) {

                const pageProducts = img_data.slice(
                    page * PRODUCTS_PER_PAGE,
                    (page + 1) * PRODUCTS_PER_PAGE
                );

                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                canvas.width = COLS * CELL_WIDTH;
                canvas.height = (ROWS * CELL_HEIGHT) + INFO_BAR_HEIGHT;

                // Background
                ctx.fillStyle = "#5a2323";
                ctx.fillRect(0, 0, canvas.width, ROWS * CELL_HEIGHT);

                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = "high";

                // Draw Images
                for (let i = 0; i < pageProducts.length; i++) {

                    const product = pageProducts[i];

                    const col = i % COLS;
                    const row = Math.floor(i / COLS);

                    const x = col * CELL_WIDTH;
                    const y = row * CELL_HEIGHT;

                    const res = await fetch(product.image);
                    const blob = await res.blob();
                    const bitmap = await createImageBitmap(blob);

                    const crop = 2;

                    ctx.drawImage(
                        bitmap,
                        crop,
                        crop,
                        bitmap.width - crop * 2,
                        bitmap.height - crop * 2,
                        x - 1,
                        y - 1,
                        CELL_WIDTH + 2,
                        CELL_HEIGHT + 2
                    );

                }

                // ==========================
                // Bottom Information Bar
                // ==========================

                const infoY = ROWS * CELL_HEIGHT;

                // White Background
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, infoY, canvas.width, INFO_BAR_HEIGHT);

                // Top Border
                ctx.strokeStyle = "#d5d5d5";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(0, infoY);
                ctx.lineTo(canvas.width, infoY);
                ctx.stroke();

                const product = pageProducts[0];

                // Change these keys according to your API response
                const details = [
                    `ID: ${product.id ?? ""}`,
                    `Code: ${product.code ?? ""}`,
                    `Box: ${product.box_name ?? product.box ?? ""}`
                ];

                ctx.fillStyle = "#111";
                ctx.font = "bold 24px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";

                const colWidth = canvas.width / details.length;

                details.forEach((text, index) => {

                    ctx.fillText(
                        text,
                        (colWidth * index) + (colWidth / 2),
                        infoY + (INFO_BAR_HEIGHT / 2)
                    );

                });

                const newBlob = await new Promise(resolve =>
                    canvas.toBlob(resolve, "image/jpeg", 1)
                );

                files.push(
                    new File(
                        [newBlob],
                        `Catalog_Page_${page + 1}.jpg`,
                        {
                            type: "image/jpeg"
                        }
                    )
                );

            }

            if (navigator.canShare && navigator.canShare({ files })) {

                await navigator.share({
                    files,
                    title: "Jewellery Catalog"
                });

            } else {

                alert("Sharing is not supported on this device.");

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

            // const res = await api.post("/products/list.php", formData);
            const res = await api.post("/products/catalog.php", formData);
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

    const categoryOptions = [
        { value: "", label: "All Category" },
        ...categories.map((item) => ({
            value: item.id,
            label: item.name,
        })),
    ];

    const colorOptions = [
        { value: "", label: "All Colors" },
        ...colors.map((item) => ({
            value: item.id,
            label: item.name,
        })),
    ];

    const sizeOptions = [
        { value: "", label: "All Size" },
        ...size.map((item) => ({
            value: item.id,
            label: item.size,
        })),
    ];

    const OpenPopup = (data) => {
        setpopup_data(data);
        setpopup(true)
    }

    const Product_popup = () => {

        return (
            <div className="daj-product-popup">
                <div className="daj-product-popup-close" onClick={() => { setpopup_data(); setpopup(false) }}>X</div>
                <div className="daj-product-popup-body daj-catalog-grid">
                    {popup_data.products.length > 0 &&
                        popup_data.products.map((p) => {

                            const idx = selection.findIndex(
                                (data) => data?.id === p?.id
                            );

                            return (

                                <div
                                    key={p.id}
                                    onClick={() => handleSelect(p)}
                                    className="daj-catalog-card"
                                >

                                    <input
                                        type="checkbox"
                                        checked={idx > -1}
                                        value={p.id}
                                        readOnly
                                        className="daj-catalog-checkbox"
                                    />

                                    <div className="daj-catalog-image-wrapper">

                                        <img
                                            src={p.image}
                                            draggable
                                            alt={p.id}
                                            className="daj-catalog-image"
                                        />

                                    </div>

                                    <div className="daj-catalog-info">

                                        <p>
                                            <span className="daj-catalog-label">
                                                SKU :
                                            </span>{" "}
                                            {p.sku}
                                        </p>

                                        <p>
                                            <span className="daj-catalog-label">
                                                SP :
                                            </span>{" "}
                                            {p.code}
                                        </p>

                                        {p.category_id == 6 &&
                                            <p>
                                                <span className="daj-catalog-label">
                                                    Size :
                                                </span>{" "}
                                                {p.size}
                                            </p>
                                        }
                                        <p>
                                            <span className="daj-catalog-label">
                                                Box :
                                            </span>{" "}
                                            {popup_data.box}
                                        </p>

                                    </div>
                                </div>

                            );
                        })}
                </div>
                <button className="daj-create-combine-img" onClick={() => shareCombinedCatalog()}>Share Catalog</button>
            </div >
        );
    }

    return (
        <div className="daj-custom-container">

            {/* Top Toolbar */}
            <div className="daj-catalog-actions">
                {/* <button onClick={shareCombinedCatalog} className="daj-btn-primary" ><SlShare size={18} /></button> */}
                <button onClick={shareSelectedImages} className="daj-btn-primary" ><SlShare size={18} /></button>
                <button onClick={print_selected} className="daj-btn-primary"><SlPrinter size={18} /></button>
            </div>

            {/* Header */}
            <div className="daj-custom-header">

                <h2 className="daj-custom-header-title">
                    Products
                </h2>

                <div className="daj-catalog-filter-row">

                    {/* Search */}
                    <div className="daj-search-input">

                        <input
                            type="search"
                            value={search_val}
                            placeholder="Search Products..."
                            onKeyDown={handleKeyDown}
                            onChange={(e) => setsearch_val(e.target.value)}
                            className="daj-product-search-inp"
                        />

                        <button
                            onClick={() => setsearch_btn(!search_btn)}
                            className="daj-search-icon-btn"
                        >
                            <FiSearch size={22} />
                        </button>

                    </div>

                    <Select
                        options={categoryOptions}
                        value={
                            categoryOptions.find(
                                (option) => option.value == category_filter
                            ) || categoryOptions[0]
                        }
                        onChange={(option) => setcategory_filter(option.value)}
                        styles={dajSelectStyle}
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        isSearchable
                        className="daj-react-select"
                    />

                    <Select
                        options={colorOptions}
                        value={
                            colorOptions.find(
                                (option) => option.value == color_filter
                            ) || colorOptions[0]
                        }
                        onChange={(option) => setcolor_filter(option.value)}
                        styles={dajSelectStyle}
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        isSearchable
                        className="daj-react-select"
                    />

                    <Select
                        options={sizeOptions}
                        value={
                            sizeOptions.find(
                                (option) => option.value == size_filter
                            ) || sizeOptions[0]
                        }
                        onChange={(option) => setsize_filter(option.value)}
                        styles={dajSelectStyle}
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        isSearchable
                        className="daj-react-select"
                    />

                    <button
                        onClick={select_all_product}
                        className="daj-btn-primary ml-auto"
                    >
                        {select_all ? "UnSelect All" : "Select All"}
                    </button>

                </div>

            </div>

            {/* Product Grid */}
            <div className="daj-catalog-grid">

                {products.length > 0 &&
                    products.map((p) => {

                        // const idx = selection.findIndex(
                        //     (data) => data?.production_run === p?.production_run
                        // );

                        return (

                            <div
                                key={p.production_run}
                                // onClick={() => handleSelect(p)}
                                className="daj-catalog-card"
                            >

                                {/* <input
                                    type="checkbox"
                                    checked={idx > -1}
                                    value={p.image}
                                    readOnly
                                    className="daj-catalog-checkbox"
                                /> */}

                                <div className="daj-catalog-image-wrapper">

                                    <img
                                        src={p.products[0].image}
                                        draggable
                                        alt={p.production_run}
                                        className="daj-catalog-image"
                                    />

                                </div>

                                <div className="daj-catalog-info">

                                    <p>
                                        <span className="daj-catalog-label">
                                            ID :
                                        </span>{" "}
                                        {p.production_run}
                                    </p>

                                    <p>
                                        <span className="daj-catalog-label">
                                            SP :
                                        </span>{" "}
                                        {p.products[0].code}
                                    </p>

                                    {p.category_id == 6 &&
                                        <p>
                                            <span className="daj-catalog-label">
                                                Size :
                                            </span>{" "}
                                            {p.size}
                                        </p>
                                    }
                                    <p>
                                        <span className="daj-catalog-label">
                                            Box :
                                        </span>{" "}
                                        {p.box}
                                    </p>

                                </div>
                                <button className="daj-product-view-btn" onClick={() => OpenPopup(p)}>View Colors</button>

                            </div>

                        );
                    })}

                {loading && (
                    <div className="daj-catalog-empty">
                        <FaSpinner className="daj-spinner" />
                    </div>
                )}

                {!loading && products.length === 0 && (
                    <div className="daj-catalog-empty">

                        <img
                            src={noDataImg}
                            alt="No Data Found"
                            className="daj-product-no-data-img"
                        />

                        <h3 className="daj-product-no-data-title">
                            No Products Found
                        </h3>

                    </div>
                )}

            </div>

            {/* pagination */}
            <div className="daj-catalog-toolbar">
                <div className="daj-catalog-pagination">
                    <span className="text-base">Page</span>
                    <input
                        type="number"
                        min={1}
                        max={total_page}
                        value={pagination_val}
                        onChange={(e) => setpagination_val(e.target.value)}
                        className="daj-catalog-pagination-input"
                    />
                    <span>/ {total_page}</span>
                    <button onClick={() => { scrollToTop(); fetchProducts(pagination_val); }} className="daj-catalog-go-btn">Go</button>
                </div>
            </div>
            {popup && <Product_popup />}
        </div>
    );
}

export default Catalog;