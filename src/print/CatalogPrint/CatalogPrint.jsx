import { useEffect, useState } from "react";
import "./CatalogPrint.scss"
import api from "../../api/axios";
import { SlShare } from "react-icons/sl";
import { FaSpinner } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";

const Catalogprint = () => {
    const [products, setProducts] = useState([]);
    const [loading, setloading] = useState(false);
    const [cart_loading, setcart_loading] = useState(-1);

    const params = useParams();
    const userData = useSelector(state => state.auth.data);


    useEffect(() => {
        if (userData.user?.role == 'admin' || userData.user?.role == 'manager') {
            get_cart_data();
        } else if (userData.user.id == params.id) {
            get_cart_data();
        } else {
            setloading(false);
        }
    }, [])

    const get_cart_data = async () => {

        let formData = new FormData;
        formData.append('user_id', params.id);

        const res = await api.post("/cart/get_cart.php", formData);


        if (res.data?.status) {
            setProducts(res.data?.data)
        }
    }

    const shareSelectedImages = async () => {
        try {
            const currentUrl = window.location.href;

            if (navigator.share) {
                await navigator.share({
                    title: "Jewellery Catalog",
                    url: currentUrl
                });
            } else {
                await navigator.clipboard.writeText(currentUrl);
                alert("Page link copied!");
            }
        } catch (err) {
            console.error(err);

            if (err.name !== "AbortError") {
                alert("Share failed");
            }
        }
    };

    const remove_cart = async (id, idx) => {
        setcart_loading(idx);
        const formData = new FormData();

        formData.append("action", 'remove');
        formData.append("product_id", id);

        const res = await api.post("/cart/add_to_cart.php", formData);

        if (res.data.status) {

            let old_array = [...products];
            let index = old_array.findIndex((data) => data?.product_id == id);
            if (index > -1) {
                old_array.splice(index, 1);
            }

            setProducts(old_array);
            setcart_loading(-1);
        } else {
            setcart_loading(-1);
        }

    }

    return (
        <div className="daj-product-catalog-print">
            <div className="daj-product-list-header">
                <h2 className="daj-product-list-header-txt">GiftDiamond Cart</h2>
            </div>
            {userData.user.id == params.id &&
                <div className="daj-catalog-actions">
                    <button onClick={() => shareSelectedImages()} className="daj-btn-primary" ><SlShare size={18} /></button>
                </div>
            }
            <div className="daj-product-catalog-body">
                {products.length > 0 && products.map((p, index) => {
                    return (
                        <div className="daj-catalog-product-outer" key={index}>
                            <div className="daj-catalog-product-image">
                                <img className="daj-product-img" src={p.image} draggable />
                            </div>
                            <div className="daj-catalog-product-data">
                                <span className="daj-catalog-product-info">SKU : {p.sku}</span>
                                <span className="daj-catalog-product-info">Code : {p.code}</span>
                                <span className="daj-catalog-product-info">Box : {p.box}</span>
                                {userData.user.id == params.id &&
                                    (cart_loading == index ?
                                        <button className="daj-remove-cart"><FaSpinner className="daj-cart-spinner" /></button>
                                        :
                                        <button className="daj-remove-cart" onClick={() => { remove_cart(p?.product_id, index) }} disabled={cart_loading == index}>remove</button>
                                    )
                                }
                                {/* <span className="daj-catalog-product-info">Net : {p.net_weight_with_margin.toFixed(2) || "-"}</span> */}
                                {/* <span className="daj-catalog-product-info">LP : {(Math.round((p.total_labour_with_margin) / 10) * 10)}</span> */}
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

export default Catalogprint;