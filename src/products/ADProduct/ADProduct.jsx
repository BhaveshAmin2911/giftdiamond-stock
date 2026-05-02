import { useState } from "react";
import { useSelector } from "react-redux";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

const ADProduct = () => {

    const [product_sku, setproduct_sku] = useState();
    const [product_img, setproduct_img] = useState();
    const [select_category, setselect_category] = useState();
    const [product_weight, setproduct_weight] = useState();
    const [product_lp, setproduct_lp] = useState();
    const [p_note, setp_note] = useState();
    const [btn_loading, setbtn_loading] = useState(false);

    const categories = useSelector(state => state.category.list);
    const navigate = useNavigate();

    const submit_product = async () => {
        if (!product_sku || !product_img) {
            alert('product SKU or Image can not empty');

            return;
        }

        if (!select_category) {
            alert('Select product Category');

            return;
        }

        setbtn_loading(true);

        const formData = new FormData();

        formData.append("sku", product_sku);
        formData.append("note", p_note);
        formData.append("weight", product_weight);
        formData.append("product_lbr", product_lp);
        formData.append("category", select_category);
        formData.append("image", product_img);

        let result = await api.post("/products/create-ad-product.php", formData);

        if (result.data.status) {
            navigate('/products/process');
        } else {
            let message = result?.data?.message ? result?.data?.message : 'Something Wrong Product can not Create';
            alert(message);
        }

        setbtn_loading(false);
    }
    return (
        <div className='daj-product-content-form'>
            <div className="daj-add-product-body">
                <div className='daj-add-product-main-data'>
                    <div className="daj-add-product-img-sku">
                        <div className="daj-add-product-sku">
                            <span className="daj-add-product-sku-txt">SKU</span>
                            <input type="text" className="daj-add-product-sku-inp" value={product_sku} onChange={(e) =>
                                setproduct_sku(e.target.value.trim())
                            } />
                        </div>
                        <div className='daj-add-product-img-con'>
                            <span className="daj-add-product-img-txt">Product Image</span>
                            <label className="daj-add-product-img" htmlFor="daj-add-product-img-inp"
                                onDragOver={(e) => { e.preventDefault(); }}
                                onDrop={(e) => {
                                    e.preventDefault(); setproduct_img(e.dataTransfer.files[0]);
                                }}>
                                {product_img ?
                                    <img src={window.URL.createObjectURL(product_img)} width='150px' />
                                    :
                                    <span className="daj-img-placeholder">Upload Image</span>
                                }
                                <input id="daj-add-product-img-inp"
                                    type="file"
                                    onChange={(e) => { setproduct_img(e.target.files[0]) }} />
                            </label>
                        </div>
                    </div>
                    <div className='daj-product-casting-form'>
                        <span className='daj-product-casting-header'>Product Category</span>
                        <select className='daj-product-casting-karigar' value={select_category} onChange={(e) => setselect_category(e.target.value)}>
                            <option value={''} >None</option>
                            {categories.map((category, index) => {
                                return (
                                    <option value={category.id} key={index}>{category.name}</option>
                                );
                            })
                            }
                        </select>

                        <div className="daj-add-product-weight">
                            <span className="daj-add-product-weight-txt">Weight : </span>
                            <input type="text" className="daj-add-product-weight-inp" value={product_weight} onChange={(e) =>
                                setproduct_weight(e.target.value.trim())
                            } />
                        </div>

                        <div className="daj-add-product-lp">
                            <span className="daj-add-product-lp-txt">LBR : </span>
                            <input type="text" className="daj-add-product-lp-inp" value={product_lp} onChange={(e) =>
                                setproduct_lp(e.target.value.trim())
                            } />
                        </div>
                        <div className='daj-product-note-con'>
                            <span className='daj-product-note-header'>Note : -</span>
                            <textarea className='daj-product-note-header' value={p_note} onChange={(e) => setp_note(e.target.value)} />
                        </div>
                    </div>
                </div>
            </div>
            <div className='daj-add-product-footer'>
                {btn_loading ?
                    <button className='daj-product-submit'>Loading ...</button>
                    :
                    <button className='daj-product-submit' onClick={() => { submit_product() }}>Submit</button>
                }
            </div>
        </div>
    );
}

export default ADProduct;