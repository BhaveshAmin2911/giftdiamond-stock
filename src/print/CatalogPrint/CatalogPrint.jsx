import { useEffect, useState } from "react";
import "./CatalogPrint.scss"

const Catalogprint = () => {
    const [products, setProducts] = useState([]);
    const [loading, setloading] = useState(false);

    const params = new URLSearchParams(window.location.search);
    const key = params.get("key");

    useEffect(() => {
        const product_array = JSON.parse(sessionStorage.getItem(key));
        if (product_array?.length > 0) {
            setProducts(product_array);
            sessionStorage.removeItem(key);
        }

    }, [sessionStorage?.getItem(key)])

    return (
        <div className="daj-product-catalog-print">
            <div className="daj-product-list-header">
                <h2 className="daj-product-list-header-txt">Daj Catalog</h2>
            </div>
            <div className="daj-product-catalog-body">
                {products.length > 0 && products.map((p, index) => {
                    return (
                        <div className="daj-catalog-product-outer">
                            <div className="daj-catalog-product-image">
                                <img className="daj-product-img" src={p.image} draggable />
                            </div>
                            <div className="daj-catalog-product-data">
                                <span className="daj-catalog-product-info">SKU : {p.sku + "-" + p.production_run}</span>
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