import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./Catalog.css"
import { useSelector } from "react-redux";
import Select from "react-select";
import { FiSearch } from "react-icons/fi";
import noDataImg from "../../assests/img/no-data-img.svg";
import { FaSpinner } from "react-icons/fa";


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
    const selectStyles = {
        control: (base, state) => ({
            ...base,
            minHeight: 42,
            borderRadius: 8,
            borderColor: state.isFocused
                ? "var(--primary-color)"
                : "var(--border-color)",
            boxShadow: "none",
            "&:hover": {
                borderColor: "var(--primary-color)",
            },
            cursor: "pointer"
        }),

        menu: (base) => ({
            ...base,
            borderRadius: 8,
            overflow: "hidden",
            zIndex: 9999,
        }),

        menuPortal: (base) => ({
            ...base,
            zIndex: 9999,
        }),

        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected
                ? "var(--primary-color)"
                : state.isFocused
                    ? "var(--primary-light-color)"
                    : "white",
            color: state.isSelected ? "#fff" : "black",
            cursor: "pointer",
        }),
    };
    return (
        <div className="catalog-page">

            {/* Top Toolbar */}
            <div className="catalog-toolbar">

                <div className="catalog-actions">
                    <button
                        onClick={shareSelectedImages}
                        className="catalog-btn"
                    >
                        Share Selected
                    </button>

                    <button
                        onClick={print_selected}
                        className="catalog-btn"
                    >
                        Print Selected
                    </button>
                </div>

                <div className="catalog-pagination">

                    <span className="text-base">Page</span>

                    <input
                        type="number"
                        min={1}
                        max={total_page}
                        value={pagination_val}
                        onChange={(e) => setpagination_val(e.target.value)}
                        className="catalog-pagination-input"
                    />

                    <span>/ {total_page}</span>

                    <button
                        onClick={() => {
                            scrollToTop();
                            fetchProducts(pagination_val);
                        }}
                        className="catalog-go-btn"
                    >
                        Go
                    </button>

                </div>

            </div>

            {/* Header */}
            <div className="catalog-header">

                <h2 className="catalog-title">
                    Products
                </h2>

                <div className="catalog-filter-row">

                    {/* Search */}
                    <div className="catalog-search">

                        <input
                            type="search"
                            value={search_val}
                            placeholder="Search Products..."
                            onKeyDown={handleKeyDown}
                            onChange={(e) => setsearch_val(e.target.value)}
                            className="catalog-search-input"
                        />

                        <button
                            onClick={() => setsearch_btn(!search_btn)}
                            className="catalog-search-btn"
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
                        styles={selectStyles}
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        isSearchable
                        className="catalog-select"
                    />

                    <Select
                        options={colorOptions}
                        value={
                            colorOptions.find(
                                (option) => option.value == color_filter
                            ) || colorOptions[0]
                        }
                        onChange={(option) => setcolor_filter(option.value)}
                        styles={selectStyles}
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        isSearchable
                        className="catalog-select"
                    />

                    <Select
                        options={sizeOptions}
                        value={
                            sizeOptions.find(
                                (option) => option.value == size_filter
                            ) || sizeOptions[0]
                        }
                        onChange={(option) => setsize_filter(option.value)}
                        styles={selectStyles}
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        isSearchable
                        className="catalog-select"
                    />

                    <button
                        onClick={select_all_product}
                        className="catalog-btn"
                    >
                        {select_all ? "UnSelect All" : "Select All"}
                    </button>

                </div>

            </div>

            {/* Product Grid */}
            <div className="catalog-grid">

                {products.length > 0 &&
                    products.map((p) => {

                        const idx = selection.findIndex(
                            (data) => data?.id === p?.id
                        );

                        return (

                            <div
                                key={p.id}
                                onClick={() => handleSelect(p)}
                                className="catalog-card"
                            >

                                <input
                                    type="checkbox"
                                    checked={idx > -1}
                                    value={p.image}
                                    readOnly
                                    className="catalog-checkbox"
                                />

                                <div className="catalog-image-wrapper">

                                    <img
                                        src={p.image}
                                        draggable
                                        alt={p.sku}
                                        className="catalog-image"
                                    />

                                </div>

                                <div className="catalog-info">

                                    <p>
                                        <span className="catalog-label">
                                            SKU :
                                        </span>{" "}
                                        {p.sku}
                                    </p>

                                    <p>
                                        <span className="catalog-label">
                                            SP :
                                        </span>{" "}
                                        {p.code}
                                    </p>

                                    {p.category_id == 6 ? (
                                        <p>
                                            <span className="catalog-label">
                                                Size :
                                            </span>{" "}
                                            {p.size}
                                        </p>
                                    ) : (
                                        <p>
                                            <span className="catalog-label">
                                                Design :
                                            </span>{" "}
                                            {p.design_no}
                                        </p>
                                    )}

                                    <p>
                                        <span className="catalog-label">
                                            Box :
                                        </span>{" "}
                                        {p.box_name}
                                    </p>

                                </div>

                            </div>

                        );
                    })}

                {loading && (
                    <div className="catalog-empty">
                        <FaSpinner className="catalog-spinner" />
                    </div>
                )}

                {!loading && products.length === 0 && (
                    <div className="catalog-empty">

                        <img
                            src={noDataImg}
                            alt="No Data Found"
                            className="catalog-no-data-img"
                        />

                        <h3 className="catalog-no-data-title">
                            No Products Found
                        </h3>

                        {/* <p className="catalog-no-data-text">
                            Try changing your search or filters.
                        </p> */}

                    </div>
                )}

            </div>

        </div>
    );
}

export default Catalog;