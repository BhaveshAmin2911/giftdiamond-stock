import { useEffect, useState } from 'react';
import './CreateProduct.scss'
import { useSelector } from "react-redux";
import api from '../../api/axios';
import { Link, useNavigate } from 'react-router-dom';
import ReProcessProduct from '../reProcessProduct/reProcessProduct';
import ReStockProduct from '../reStockProduct/reStockProduct';
import ADProduct from '../ADProduct/ADProduct';

const CreateProduct = () => {
    const karigars = useSelector(state => state.karigars.list);
    const categories = useSelector(state => state.category.list);
    const colors = useSelector(state => state.colors.list);
    const polish = useSelector(state => state.polish.list);
    
    const price_diff = [
        { id: 2, min: 0, max: 2000 },
        { id: 4, min: 2000, max: 4000 },
        { id: 6, min: 4000, max: 6000 },
        { id: 8, min: 6000, max: 8000 },
        { id: 10, min: 8000, max: 10000 },
        { id: 12, min: 10000, max: 12000 },
        { id: 14, min: 12000, max: 14000 },
        { id: 16, min: 14000, max: 16000 },
        { id: 18, min: 16000, max: 18000 },
        { id: 20, min: 18000, max: 20000 },
        { id: 22, min: 20000, max: 22000 },
        { id: 24, min: 22000, max: 24000 },
        { id: 26, min: 24000, max: 26000 },
        { id: 28, min: 26000, max: 28000 },
        { id: 30, min: 28000, max: 30000 },
    ]

    const navigate = useNavigate();

    const [product_img, setproduct_img] = useState();
    const [select_category, setselect_category] = useState();
    const [select_karigar, setselect_karigar] = useState();
    const [select_color, setselect_color] = useState();
    const [select_polish, setselect_polish] = useState(2);
    const [product_note, setproduct_note] = useState();
    const [product_quantity, setproduct_quantity] = useState();
    const [product_code, setproduct_code] = useState();
    const [design_number, setdesign_number] = useState();

    const [select_method, setselect_method] = useState();
    const [btn_loading, setbtn_loading] = useState(false);

    const get_sku = () => {
        let clr_idx = colors?.findIndex((data) => data?.id == select_color);
        let pls_idx = polish?.findIndex((data) => data?.id == select_polish);
        let cat_idx = categories?.findIndex((data) => data?.id == select_category);

        if (clr_idx == -1 || pls_idx == -1 || cat_idx == -1) {
            alert("Somthing went wrong !");

            return;
        }

        let clr_code = colors[clr_idx]?.code ? colors[clr_idx].code : 'NaN';
        let pls_code = polish[pls_idx]?.code != "W" ? polish[pls_idx].code : '';
        let cat_code = categories[cat_idx]?.code ? categories[cat_idx].code : 'NaN';

        const match = price_diff.find(item => product_code >= item.min && product_code < item.max);
        let price_code = match ? match.id : 0;

        return select_karigar + price_code + clr_code + cat_code + pls_code;
    }

    const submit_product = async () => {
        if (!product_img) {
            alert('Insert Image');
            return;
        }
        if (!select_category) {
            alert('Select Category');
            return;
        }
        if (!select_karigar) {
            alert('Select Karigar');
            return;
        }
        if (!select_color) {
            alert('Select Color');
            return;
        }
        if (!select_polish) {
            alert('Select Polish');
            return;
        }
        if (!product_quantity) {
            alert('Enter Product Quantity');
            return;
        }
        if (!product_code) {
            alert('Enter Product Code');
            return;
        }

        setbtn_loading(true);

        let sku = get_sku();

        const formData = new FormData();
        formData.append("sku", sku);
        formData.append("category", select_category);
        formData.append("karigar", select_karigar);
        formData.append("color", select_color);
        formData.append("polish", select_polish);
        formData.append("quantity", product_quantity);
        formData.append("code", product_code);
        formData.append("design_no", design_number);
        formData.append("product_note", product_note);
        formData.append("image", product_img);

        let result = await api.post("/products/create.php", formData);

        if (result.data.status) {
            navigate('/products/process');
        } else {
            let message = result?.data?.message ? result?.data?.message : 'Something Wrong Product can not Create';
            alert(message);
        }

        setbtn_loading(false);
    }

    const create_product = () => {
        return (
            <div className='daj-product-content-form'>
                <div className="daj-add-product-body">
                    <div className='daj-add-product-main-data'>
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
                        <div className='daj-add-product-form'>
                            <div className='daj-product-data-right'>
                                <div className='daj-product-info-form'>
                                    <span className='daj-product-info-header'>Category</span>
                                    <select className='daj-product-info-body' value={select_category} onChange={(e) => setselect_category(e.target.value)}>
                                        <option value={''} >None</option>
                                        {categories.map((category, index) => {
                                            return (
                                                <option value={category.id} key={index}>{category.name}</option>
                                            );
                                        })
                                        }
                                    </select>
                                </div>
                                <div className='daj-product-info-form'>
                                    <span className='daj-product-info-header'>Karigar</span>
                                    <select className='daj-product-info-body' value={select_karigar} onChange={(e) => setselect_karigar(e.target.value)}>
                                        <option value={''} >None</option>
                                        {karigars.map((category, index) => {
                                            return (
                                                <option value={category.id} key={index}>{category.name}</option>
                                            );
                                        })
                                        }
                                    </select>
                                </div>
                                <div className='daj-product-info-form'>
                                    <span className='daj-product-info-header'>Color</span>
                                    <select className='daj-product-info-body' value={select_color} onChange={(e) => setselect_color(e.target.value)}>
                                        <option value={''} >None</option>
                                        {colors.map((category, index) => {
                                            return (
                                                <option value={category.id} key={index}>{category.name}</option>
                                            );
                                        })
                                        }
                                    </select>
                                </div>
                                <div className='daj-product-info-form'>
                                    <span className='daj-product-info-header'>Polish</span>
                                    <select className='daj-product-info-body' value={select_polish} onChange={(e) => setselect_polish(e.target.value)}>
                                        {polish.map((category, index) => {
                                            return (
                                                <option value={category.id} key={index}>{category.name}</option>
                                            );
                                        })
                                        }
                                    </select>
                                </div>
                            </div>
                            <div className='daj-product-data-left'>
                                <div className="daj-add-product-price">
                                    <span className="daj-add-product-price-txt">Price Code</span>
                                    <input type="text" className="daj-add-product-price-inp" value={product_code} onChange={(e) =>
                                        setproduct_code(e.target.value.trim())
                                    } />
                                </div>
                                <div className="daj-add-product-design">
                                    <span className="daj-add-product-design-txt">Design Code</span>
                                    <input type="text" className="daj-add-product-design-inp" value={design_number} onChange={(e) =>
                                        setdesign_number(e.target.value.trim())
                                    } />
                                </div>
                                <div className="daj-add-product-quantity">
                                    <span className="daj-add-product-quantity-txt">Quantity</span>
                                    <input type="text" className="daj-add-product-quantity-inp" value={product_quantity} onChange={(e) =>
                                        setproduct_quantity(e.target.value.trim())
                                    } />
                                </div>
                                <div className="daj-add-product-note">
                                    <span className="daj-add-product-note-txt">Note</span>
                                    <textarea className="daj-add-product-note-inp" rows={2} value={product_note} onChange={(e) =>
                                        setproduct_note(e.target.value.trim())
                                    } />
                                </div>
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

    return (
        <div className="daj-add-product-content">
            <h2 className="daj-add-product-header">Create product page</h2>
            {!select_method &&
                <div className='daj-product-insert-method'>
                    <div className='daj-insert-method-opt' onClick={() => { setselect_method('new_product') }}>
                        <span>New Product</span>
                    </div>
                    <div className='daj-insert-method-opt' onClick={() => { setselect_method('restock_product') }}>
                        <span>Restock Product</span>
                    </div>
                </div>
            }
            {select_method == 'new_product' && create_product()}
            {select_method == 'restock_product' && <ReStockProduct />}
        </div>
    );
}

export default CreateProduct;