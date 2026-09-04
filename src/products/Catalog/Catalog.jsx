import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./Catalog.css"
import { useSelector } from "react-redux";
import Select from "react-select";
import { FiSearch } from "react-icons/fi";
import { FaShoppingCart } from "react-icons/fa";
import { SlShare } from "react-icons/sl";
import { SlPrinter } from "react-icons/sl";
import noDataImg from "../../assests/img/no-data-img.svg";
import { FaSpinner } from "react-icons/fa";
import { dajSelectStyle } from "../../Common/reactSelectStyles";
import { Link } from "react-router-dom";


const Catalog = () => {
    const [products, setProducts] = useState([]);
    const [search_val, setsearch_val] = useState('');
    const [search_btn, setsearch_btn] = useState(true);
    const [karigar_filter, setkarigar_filter] = useState('');
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
    const [user_data, setuser_data] = useState();
    const [cart_count, setcart_count] = useState(0);
    const [cart_loading, setcart_loading] = useState(-1);

    const categories = useSelector(state => state.category.list);
    const karigars = useSelector(state => state.karigars.list);
    const colors = useSelector(state => state.colors.list);
    const size = useSelector(state => state.size.list);
    const userData = useSelector(state => state.auth.data);

    useEffect(() => {
        // Add a fake history entry
        window.history.pushState(null, "", window.location.href);

        const handlePopState = () => {
            // Stay on the current page
            window.history.pushState(null, "", window.location.href);

            // Your custom function
            myFunction();
        };

        window.addEventListener("popstate", handlePopState);

        return () => {
            window.removeEventListener("popstate", handlePopState);
        };
    }, []);

    const myFunction = () => {

        if (document.querySelector('.daj-custom-container')) {
            setpopup_data();
            setpopup(false);
        } else {
            window.history.back();
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [search_btn, category_filter, karigar_filter, color_filter, current_page, size_filter]);

    useEffect(() => {
        setuser_data(userData?.user);
    }, [userData])

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
                // const design_no = checkbox.design_no;
                const box = checkbox.box;
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

                    if (main_data.category_id == 6) {
                        const text = pageProducts[i]?.size;

                        ctx.font = "bold 32px Arial";
                        ctx.textAlign = "right";
                        ctx.textBaseline = "bottom";

                        // Optional: Draw a semi-transparent black background
                        const padding = 8;
                        const textWidth = ctx.measureText(text).width;
                        const textHeight = 40;

                        ctx.fillStyle = "rgba(0,0,0,0.55)";
                        ctx.fillRect(
                            x + CELL_WIDTH + 2 - textWidth - padding * 2,
                            y + CELL_WIDTH + 2 - textHeight - padding,
                            textWidth + padding * 2,
                            textHeight + padding
                        );

                        // White text
                        ctx.fillStyle = "#fff";
                        ctx.fillText(
                            text,
                            x + CELL_WIDTH + 2 - padding,
                            y + CELL_WIDTH + 2 - padding
                        );
                    }
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
                    `ID: ${main_data.production_run ?? ""}`,
                    `Code: ${product.code ?? ""}`,
                    `Box: ${product.box ?? ""}`
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
            formData.append("karigar_id", karigar_filter);
            formData.append("color", color_filter);
            formData.append("size", size_filter);
            formData.append("per_page", 60);
            formData.append("current_page", page);

            // const res = await api.post("/products/list.php", formData);
            const res = await api.post("/products/catalog.php", formData);
            if (res.data.status) {
                setProducts(res.data.data);
                setselection(res.data.cart_product_ids);
                setcart_count(res.data.cart_count);
                settotal_page(res.data?.pagination?.total_pages)
            }
        } catch (error) {
            console.error(error);
        }

        setloading(false);
    };

    const add_to_cart = async (id, action, idx) => {
        setcart_loading(idx);
        const formData = new FormData();

        formData.append("action", action);
        formData.append("product_id", id);

        const res = await api.post("/cart/add_to_cart.php", formData);

        if (res.data.status) {

            setcart_count(res.data?.cart_count);
            let old_array = [...selection];
            let index = old_array.findIndex((data_id) => data_id == id);
            if (index > -1) {
                old_array.splice(index, 1);
            } else {
                old_array.push(id);
            }

            setselection(old_array);
            setcart_loading(-1);
        } else {
            setcart_loading(-1);
        }

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

    const karigarOptions = [
        { value: "", label: "All Karigar" },
        ...karigars.map((item) => ({
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
                        popup_data.products.map((p, index) => {
                            const idx = selection.includes(p?.id);

                            return (
                                <div key={p.id} className="daj-catalog-card" >
                                    {idx &&
                                        <input type="checkbox" checked={idx} value={p.id} readOnly className="daj-catalog-checkbox" />
                                    }
                                    <div className="daj-catalog-image-wrapper">
                                        <img className="daj-catalog-image" src={p.image} draggable alt={p.id} />
                                    </div>
                                    <div className="daj-catalog-info">
                                        <p>
                                            <span className="daj-catalog-label"> SKU : </span>
                                            {" " + p.sku}
                                        </p>
                                        <p>
                                            <span className="daj-catalog-label">SP :</span>
                                            {" " + p.code}
                                        </p>
                                        {user_data?.role != "customer" &&
                                            <p>
                                                <span className="daj-catalog-label">Quantity :</span>
                                                {" " + p.quantity}
                                            </p>
                                        }
                                        <p>
                                            <span className="daj-catalog-label">Box : </span>
                                            {" " + popup_data.box}
                                        </p>
                                        {popup_data.category_id == 6 &&
                                            <p>
                                                <span className="daj-catalog-label">Size : </span>
                                                {" " + p.size}
                                            </p>
                                        }
                                        <div className="daj-cart-ations">
                                            {cart_loading == index ?
                                                <button className="daj-remove-cart"><FaSpinner className="daj-cart-spinner" /></button>
                                                :
                                                (idx ?
                                                    <button className="daj-remove-cart" disabled={cart_loading > -1} onClick={() => { add_to_cart(p?.id, "remove", index) }}>Remove</button>
                                                    :
                                                    <button className="daj-add-cart" disabled={cart_loading > -1} onClick={() => { add_to_cart(p?.id, "add", index) }} >Add To cart</button>
                                                )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                </div>
                {
                    user_data?.role != 'customer' &&
                    <button className="daj-create-combine-img" onClick={() => shareCombinedCatalog()}>Share Catalog</button>
                }
            </div>
        );
    }

    return (
        <div className="daj-custom-container">
            {/* Top Toolbar */}
            <div className="daj-catalog-actions">
                {/* <button onClick={shareSelectedImages} className="daj-btn-primary" ><SlShare size={18} /></button>
                <button onClick={print_selected} className="daj-btn-primary"><SlPrinter size={18} /></button> */}
                <Link to={'/print/catalog/' + userData.user.id} className="daj-btn-primary daj-cart-btn">
                    <FaShoppingCart size={18} />
                    <span className="daj-cart-count">{cart_count}</span>
                </Link>
            </div>
            {/* Header */}
            <div className="daj-custom-header">
                <h2 className="daj-custom-header-title">Products</h2>
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
                        <button className="daj-search-icon-btn" onClick={() => setsearch_btn(!search_btn)} > <FiSearch size={22} />
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
                    {user_data?.role != "customer" &&
                        <Select
                            options={karigarOptions}
                            value={
                                karigarOptions.find(
                                    (option) => option.value == karigar_filter
                                ) || karigarOptions[0]
                            }
                            onChange={(option) => setkarigar_filter(option.value)}
                            styles={dajSelectStyle}
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                            isSearchable
                            className="daj-react-select"
                        />
                    }
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
                    <button onClick={select_all_product} className="daj-btn-primary ml-auto">
                        {select_all ? "UnSelect All" : "Select All"}
                    </button>
                </div>
            </div>

            {/* Product Grid */}
            <div className="daj-catalog-grid">
                {products.length > 0 &&
                    products.map((p) => {
                        return (
                            <div key={p.production_run} className="daj-catalog-card">
                                <div className="daj-catalog-image-wrapper">
                                    <img className="daj-catalog-image" src={p.products[0].image} draggable alt={p.production_run} />
                                </div>
                                <div className="daj-catalog-info">
                                    <p>
                                        <span className="daj-catalog-label"> ID : </span>
                                        {" " + p.production_run}
                                    </p>
                                    <p>
                                        <span className="daj-catalog-label">SP : </span>
                                        {" " + p.products[0].code}
                                    </p>
                                    <p>
                                        <span className="daj-catalog-label"> Box : </span>
                                        {" " + p.box}
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
                        <img src={noDataImg} alt="No Data Found" className="daj-product-no-data-img" />
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
            {popup && Product_popup()}
        </div>
    );
}

export default Catalog;