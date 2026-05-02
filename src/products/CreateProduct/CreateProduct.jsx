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
    const settingTypes = useSelector(state => state.settingTypes.list);

    const navigate = useNavigate();

    const [product_sku, setproduct_sku] = useState('');
    const [product_img, setproduct_img] = useState();
    const [p_note, setp_note] = useState('');
    const [p_urgent, setp_urgent] = useState(false);
    const [urgent_time, seturgent_time] = useState();
    const [select_category, setselect_category] = useState('');
    const [select_karigar, setselect_karigar] = useState('');
    const [product_status, setproduct_status] = useState('casting');
    const [select_method, setselect_method] = useState();
    const [product_data, setproduct_data] = useState([]);
    const [btn_loading, setbtn_loading] = useState(false);

    useEffect(() => {
        setproduct_data(settingTypes);
    }, [settingTypes])

    const productDataHandler = (idx, value) => {
        let old_data = [...product_data];

        if (old_data?.[idx]?.value) {
            old_data[idx].value = value;
        } else {
            old_data[idx] = Object.assign({}, old_data[idx], { 'value': value });
        }

        setproduct_data(old_data);
    }

    const submit_product = async () => {
        if (!product_sku || !product_img) {
            alert('product SKU or Image can not empty');

            return;
        }

        if (!select_category) {
            alert('Select product Category');

            return;
        }

        if (product_status == 'casting' && !select_karigar) {
            alert('casting karigar not found');

            return;
        }

        setbtn_loading(true);

        const formData = new FormData();
        if (product_status == 'casting') {
            formData.append("current_karigar_id", select_karigar);
            var status = 1;
        } else {
            var status = 0;
        }


        formData.append("sku", product_sku);

        if (product_data.length > 0) {

            product_data.map((detail) => {
                if (detail.value) {
                    formData.append([detail.name], detail.value);
                }
            })
        }

        if (p_urgent) {
            if (!urgent_time) {
                alert('Give Deadline time for Product');

                return;
            }

            formData.append('urgent', p_urgent);
            formData.append('urgent_time', urgent_time);
        }

        formData.append("note", p_note);
        formData.append("status", status);
        formData.append("category", select_category);
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
                            <div className='daj-product-urgent-con'>
                                <label className='daj-product-urgent-header' htmlFor='daj_urgent_work_inp'>
                                    <input type='checkbox' id='daj_urgent_work_inp' value={p_urgent} onChange={(e) => setp_urgent(e.target.checked)} />
                                    <span className='daj-product-urgent-txt'>Urgent Work</span>
                                </label>
                                {p_urgent &&
                                    <input className='daj-urgent-date-inp' type='date' value={urgent_time} onChange={(e) => seturgent_time(e.target.value)} />
                                }
                            </div>
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
                            <span className='daj-product-casting-header'>Casting Detail</span>
                            <select className='daj-product-casting-karigar' value={select_karigar} onChange={(e) => setselect_karigar(e.target.value)}>
                                <option value={''} >None</option>
                                {karigars.map((karigar, index) => {
                                    return (
                                        <option value={karigar.id} key={index}>{karigar.name}</option>
                                    );
                                })
                                }
                            </select>
                            <div className='daj-product-check-box'>
                                <input type='checkbox' id='daj-product-at-office' checked={product_status == 'office'} onChange={(e) => {
                                    if (e.target.checked) {
                                        setproduct_status('office');
                                    } else {
                                        setproduct_status('casting');
                                    }
                                }} />
                                <label htmlFor='daj-product-at-office'>Not in casting</label>
                            </div>
                        </div>
                    </div>
                    <div className='daj-add-product-other-data'>
                        <h3 className='daj-product-other-header'>Diamond Details</h3>
                        <div className='daj-product-other-body'>
                            {product_data.map((work, index) => {
                                let exclud_array = ['14', '15', '16'];

                                if (!(exclud_array.includes(work?.id))) {
                                    let val = work.value ? work.value : '';

                                    return (
                                        <div className='daj-product-other-data-con' key={index}>
                                            <span>{work.name}</span>
                                            <input className='daj-product-other-data-inp' value={val} onChange={(e) => { productDataHandler(index, e.target.value) }} />
                                        </div>
                                    );
                                }
                            })}
                        </div>
                        <div className='daj-product-note-con'>
                            <span className='daj-product-note-header'>Note : -</span>
                            <textarea className='daj-product-note-header' value={p_note} onChange={(e) => setp_note(e.target.value)} />
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
                <div className='daj-product-inster-method'>
                    <div className='daj-inster-method-opt' onClick={() => { setselect_method('new_product') }}>
                        <span>New Product</span>
                    </div>
                    {/* <div className='daj-inster-method-opt' onClick={() => { setselect_method('existing_product') }}>
                        <span>Existing Product</span>
                    </div> */}
                    {/* <div className='daj-inster-method-opt' onClick={() => { setselect_method('finish_product') }}>
                        <span>Finish Product</span>
                    </div> */}
                    <div className='daj-inster-method-opt' onClick={() => { setselect_method('restock_product') }}>
                        <span>Restock Product</span>
                    </div>
                    <div className='daj-inster-method-opt' onClick={() => { setselect_method('ad_product') }}>
                        <span>AD Product</span>
                    </div>
                </div>
            }
            {select_method == 'new_product' && create_product()}
            {/* {select_method == 'existing_product' && <ReProcessProduct />} */}
            {select_method == 'restock_product' && <ReStockProduct />}
            {select_method == 'ad_product' && <ADProduct />}
        </div>
    );
}

export default CreateProduct;