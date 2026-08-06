import { Fragment, useEffect, useState } from 'react';
import './EditProduct.scss'
import { useSelector } from "react-redux";
import api from '../../api/axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ReProcessProduct from '../reProcessProduct/reProcessProduct';
import ReStockProduct from '../reStockProduct/reStockProduct';
import ADProduct from '../ADProduct/ADProduct';

const EditProduct = () => {
    const karigars = useSelector(state => state.karigars.list);
    const categories = useSelector(state => state.category.list);
    const colors = useSelector(state => state.colors.list);
    const polish = useSelector(state => state.polish.list);
    const size_list = useSelector(state => state.size.list);
    const box_list = useSelector(state => state.boxes.list);

    const location = useLocation();

    useEffect(() => {
        get_product_data();
    }, [])

    const get_product_data = async () => {
        const product_data = location.state;
        setselect_karigar(product_data?.karigar);
        setselect_category(product_data?.category);
        setproduction_run(product_data?.PR);

        const formData = new FormData();
        formData.append("karigar_id", product_data?.karigar);
        formData.append("category_id", product_data?.category);
        formData.append("production_run", product_data?.PR);

        let result = await api.post("/products/get-product.php", formData);
        if (result?.data?.status) {
            let pr_array = result.data?.data?.length > 0 ? result.data.data : [];
            setproduct_array(pr_array);
            setbox_id(pr_array[0]?.box_id);
            setselect_box(pr_array[0]?.box_id);
        }

    }

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
    const [product_id, setproduct_id] = useState([]);
    const [select_category, setselect_category] = useState();
    const [select_karigar, setselect_karigar] = useState();
    const [select_box, setselect_box] = useState();
    const [production_run, setproduction_run] = useState();
    const [box_id, setbox_id] = useState();

    const [select_color, setselect_color] = useState();
    const [select_polish, setselect_polish] = useState(2);
    const [product_note, setproduct_note] = useState('');
    const [product_quantity, setproduct_quantity] = useState();
    const [product_code, setproduct_code] = useState();
    const [design_number, setdesign_number] = useState();
    const [product_array, setproduct_array] = useState([]);

    const [select_method, setselect_method] = useState('new_product');
    const [btn_loading, setbtn_loading] = useState(false);

    const get_sku = (select_karigar, select_color, select_polish, select_category, product_code, p_size = 2) => {
        let clr_idx = colors?.findIndex((data) => data?.id == select_color);
        let pls_idx = polish?.findIndex((data) => data?.id == select_polish);
        let cat_idx = categories?.findIndex((data) => data?.id == select_category);

        var kargar_name = select_karigar;
        var size = p_size;

        let kargar_idx = karigars.findIndex((data) => data?.id == select_karigar)

        if (kargar_idx > -1 && karigars[kargar_idx]?.code) {
            kargar_name = karigars[kargar_idx].code;
        }

        if (clr_idx == -1 || pls_idx == -1 || cat_idx == -1) {
            alert("Somthing went wrong !");

            return;
        }

        let clr_code = colors[clr_idx]?.code ? colors[clr_idx].code : 'NaN';
        let pls_code = polish[pls_idx]?.code != "W" ? polish[pls_idx].code : '';
        let cat_code = categories[cat_idx]?.code ? categories[cat_idx].code : 'NaN';

        const match = price_diff.find(item => product_code >= item.min && product_code < item.max);
        let price_code = match ? match.id : 0;


        if (select_category == 6) {
            return String(kargar_name) + String(price_code) + (cat_code) + size + pls_code + clr_code + production_run;
        } else {
            return String(kargar_name) + String(price_code) + (cat_code) + pls_code + clr_code + production_run;
        }
    }

    const get_box_sku = () => {
        let cat_idx = categories?.findIndex((data) => data?.id == select_category);
        let cat_code = categories[cat_idx]?.code ? categories[cat_idx].code : 'NaN';
        var kargar_name = select_karigar;

        let kargar_idx = karigars.findIndex((data) => data?.id == select_karigar)

        if (kargar_idx > -1 && karigars[kargar_idx]?.code) {
            kargar_name = karigars[kargar_idx].code;
        }

        const match = price_diff.find(item => product_array[0].code >= item.min && product_array[0].code < item.max);
        let price_code = match ? match.id : 0;

        return select_karigar + price_code + cat_code;
    }

    const submit_product = async () => {
        let current_array = [...product_array];

        if (!select_category) {
            alert('Select Category');
            return;
        }

        if (!select_karigar) {
            alert('Select Karigar');
            return;
        }

        const formData = new FormData();
        if (current_array?.length > 0) {
            current_array.map((product, index) => {
                if (!product?.image) {
                    alert('Insert Image at No.' + index);
                    return;
                }
                if (!product?.color) {
                    alert('Select Color at No.' + index);
                    return;
                }
                if (!product?.polish) {
                    alert('Select Polish at No.' + index);
                    return;
                }
                if (!product?.quantity) {
                    alert('Enter Product Quantity at No.' + index);
                    return;
                }
                if (!product?.code) {
                    alert('Enter Product Code at No.' + index);
                    return;
                }

                if (product?.type == 'new') {

                    let sku = get_sku(select_karigar, product?.color, product?.polish, select_category, product?.code, product?.size);
                    var new_obj = Object.assign({}, current_array[index], { 'sku': sku, 'image_index': 'n' + index });
                    formData.append("images[n" + index + "]", product?.image);
                } else {
                    var new_obj = Object.assign({}, current_array[index], { 'image_index': product?.id });
                    formData.append("images[" + product?.id + "]", product?.image);
                }
                current_array[index] = new_obj;

            })

            setbtn_loading(true);

            formData.append("product_array", JSON.stringify(current_array));

            let result = await api.post("/products/update-product.php", formData);

            if (select_box !== box_id) {
                await update_box()
            }

            if (result.data.status) {
                navigate('/products/process');
            } else {
                let message = result?.data?.message ? result?.data?.message : 'Something Wrong Product can not Create';
                alert(message);
            }
        }

        setbtn_loading(false);
    }

    const update_box = async () => {
        const formData = new FormData();

        formData.append("box_id", select_box);
        formData.append("production_run", production_run);
        formData.append("category", select_category);

        let result = await api.post("/boxes/edit-box.php", formData);
        
        if(!(result?.data?.status)){
            alert("box not updated");
        }
    }

    const create_product = () => {
        return (
            <div className='daj-product-content-form'>
                <div className="daj-add-product-body">
                    <div className='daj-add-product-main-data'>
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
                                    <span className='daj-product-info-header'>Update Box</span>
                                    <select className='daj-product-info-body' value={select_box} onChange={(e) => setselect_box(e.target.value)}>
                                        <option value={''} >None</option>
                                        {box_list.map((box, index) => {
                                            return (
                                                <option value={box.id} key={index}>{box.name}</option>
                                            );
                                        })
                                        }
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    {product_array?.length > 0 &&
                        <>
                            <hr className='daj-add-more-product-hr' />
                            {product_array.map((pr_data, index) => {
                                return (
                                    <Fragment key={index}>
                                        {create_multi_product(pr_data, index)}
                                        {(index + 1) < product_array?.length &&
                                            <hr className='daj-add-more-product-hr' />
                                        }
                                    </Fragment>
                                );
                            })}
                        </>
                    }
                </div>
                <div className='daj-add-product-footer'>
                    {btn_loading ?
                        <button className='daj-product-submit'>Loading ...</button>
                        :
                        <button className='daj-product-submit' onClick={() => { add_multi_product() }}>Add More Product</button>
                    }
                    {btn_loading ?
                        <button className='daj-product-submit'>Loading ...</button>
                        :
                        <button className='daj-product-submit' onClick={() => { submit_product() }}>Submit</button>
                    }
                </div>
            </div>
        );
    }

    const add_multi_product = () => {
        let new_obj = {};
        let current_array = [...product_array];

        let polish = current_array?.[0]?.polish ? current_array[0].polish : 2;
        let code = current_array?.[0]?.code ? current_array[0].code : '';
        let design_no = current_array?.[0]?.design_no ? current_array[0].design_no : '';

        Object.assign(new_obj, { 'type': 'new', 'image': '', 'color': '', 'category': select_category, 'box_id': box_id, 'production_run': production_run, 'karigar': select_karigar, 'polish': polish, 'code': code, 'design_no': design_no, 'quantity': '', 'note': '' });
        current_array.push(new_obj);

        setproduct_array(current_array);
    }

    const handle_multi_product = (type, index, value) => {
        let current_data = [...product_array];

        current_data[index][type] = value;

        setproduct_array(current_data);
    }

    const create_multi_product = (pr_data, index) => {
        return (
            <div className='daj-add-product-main-data'>
                <div className='daj-add-product-form'>
                    <div className='daj-product-data-right'>
                        <div className='daj-add-product-img-con'>
                            <span className="daj-add-product-img-txt">Image</span>
                            <label className="daj-add-product-img" htmlFor={"daj-add-product-img-inp" + index}
                                onDragOver={(e) => { e.preventDefault(); }}
                                onDrop={(e) => {
                                    e.preventDefault(); handle_multi_product('image', index, e.dataTransfer.files[0]);
                                }}>
                                {pr_data?.image ?
                                    <>
                                        {(typeof pr_data?.image == 'object') ?
                                            <img src={window.URL.createObjectURL(pr_data?.image)} width='100px' />
                                            :
                                            <img src={(pr_data?.image)} width='100px' />
                                        }
                                    </>
                                    :
                                    <span className="daj-img-placeholder">Upload Image</span>
                                }
                                <input id={"daj-add-product-img-inp" + index}
                                    className='daj-add-product-img-inp'
                                    type="file"
                                    onChange={(e) => { handle_multi_product('image', index, e.target.files[0]) }} />
                            </label>
                        </div>
                        <div className='daj-product-info-form'>
                            <span className='daj-product-info-header'>Color</span>
                            <select className='daj-product-info-body' value={pr_data?.color} onChange={(e) => handle_multi_product('color', index, e.target.value)}>
                                <option value={''} >None</option>
                                {colors.map((clr, index) => {
                                    return (clr.note ?
                                        <option value={clr.id} key={index}>{clr.name + " ( " + clr.note + " )"}</option>
                                        :
                                        <option value={clr.id} key={index}>{clr.name}</option>
                                    );
                                })
                                }
                            </select>
                        </div>
                        <div className='daj-product-info-form'>
                            <span className='daj-product-info-header'>Polish</span>
                            <select className='daj-product-info-body' value={pr_data?.polish} onChange={(e) => handle_multi_product('polish', index, e.target.value)}>
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
                            <input type="text" className="daj-add-product-price-inp" value={pr_data?.code} onChange={(e) =>
                                handle_multi_product('code', index, e.target.value.trim())
                            } />
                        </div>
                        <div className="daj-add-product-design">
                            <span className="daj-add-product-design-txt">Design Code</span>
                            <input type="text" className="daj-add-product-design-inp" value={pr_data?.design_no} onChange={(e) =>
                                handle_multi_product('design_no', index, e.target.value.trim())
                            } />
                        </div>
                        <div className="daj-add-product-quantity">
                            <span className="daj-add-product-quantity-txt">Quantity</span>
                            <input type="text" className="daj-add-product-quantity-inp" value={pr_data?.quantity} onChange={(e) =>
                                handle_multi_product('quantity', index, e.target.value.trim())
                            } />
                        </div>
                        <div className="daj-add-product-note">
                            <span className="daj-add-product-note-txt">Note</span>
                            <textarea className="daj-add-product-note-inp" rows={2} value={pr_data?.note} onChange={(e) =>
                                handle_multi_product('note', index, e.target.value)
                            } />
                        </div>
                        {select_category == 6 &&
                            <div className='daj-product-info-form'>
                                <span className='daj-product-info-header'>Bangle Size</span>
                                <select className='daj-product-info-body' value={pr_data?.size} onChange={(e) => handle_multi_product('size', index, e.target.value)}>
                                    {size_list.map((p_size, index) => {
                                        return (
                                            <option value={p_size.id} key={index}>{p_size.size}</option>
                                        );
                                    })
                                    }
                                </select>
                            </div>
                        }
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="daj-add-product-content">
            <h2 className="daj-add-product-header">Edit product</h2>
            {create_product()}
        </div>
    );
}

export default EditProduct;