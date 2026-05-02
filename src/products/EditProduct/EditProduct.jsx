import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import "./EditProduct.scss"
import { useSelector } from "react-redux";


const EditProduct = () => {
    const workTypes = useSelector(state => state.workTypes.list);
    const karigars = useSelector(state => state.karigars.list);
    const settingTypes = useSelector(state => state.settingTypes.list);
    const colors = useSelector(state => state.colors.list);
    const boxes = useSelector(state => state.boxes.list);

    let gilet_array = ['15', '16'];
    let grm_product = [2, 3, 5];

    const param = useParams();
    const naviget = useNavigate();
    const [product_status, setproduct_status] = useState();
    const [next_status, setnext_status] = useState(0);
    const [current_stage, setcurrent_stage] = useState('update');
    const [gilet_type, setgilet_type] = useState(15);
    const [setting_type, setsetting_type] = useState([]);
    const [product_karigar, setproduct_karigar] = useState();
    const [product_data, setproduct_data] = useState();
    const [product_note, setproduct_note] = useState('');
    const [product_image, setproduct_image] = useState();
    const [extra_cost, setextra_cost] = useState();
    const [extra_cost_des, setextra_cost_des] = useState('');
    const [product_quantity, setproduct_quantity] = useState(0);
    const [quantity_array, setquantity_array] = useState([]);
    const [quantity_detail, setquantity_detail] = useState();
    const [work_history, setwork_history] = useState([]);
    const [net_weight, setnet_weight] = useState(0);
    const [note_array, setnote_array] = useState([]);
    const [gross_weight, setgross_weight] = useState(0);
    const [final_gross, setfinal_gross] = useState();
    const [page_loading, setpage_loading] = useState(false);
    const [btn_loading, setbtn_loading] = useState(false);
    const [lariya_pin, setlariya_pin] = useState(0);
    const [price_rate, setprice_rate] = useState(0);
    const [select_color, setselect_color] = useState('');
    const [select_box, setselect_box] = useState('');
    const [boxInp_focus, setboxInp_focus] = useState(false);
    const [casting_list, setcasting_list] = useState([]);
    const [pech_chaki, setpech_chaki] = useState(true);

    useEffect(() => {
        get_product();
    }, [])

    useEffect(() => {
        if (product_status == 1 && product_data?.casting_box_id) {
            setselect_box(product_data.casting_box_id);
        } else if (next_status == 4 && product_data?.final_box_id) {
            setselect_box(product_data.final_box_id);
        }
    }, [product_data])

    useEffect(() => {
        if (next_status == 4) {
            // var count = 0;
            var work_array = [];

            if (work_history?.length > 2) {
                work_history.map((work) => {
                    if (!work_array.includes(work.work_type)) {
                        work_array.push(work.work_type);
                    }
                })

            }

            if (work_array.length <= 2) {
                alert("Product is not ready for final stage");
                setnext_status(0);
            }

        }
    }, [next_status])

    const get_product = async () => {
        setpage_loading(true);
        const formData = new FormData();
        formData.append("product_id", param.id);

        let result = await api.post("/products/get-product.php", formData)
            .then((res) => { return res.data });
        if (result.status) {
            setproduct_data(result.product);
            setproduct_note(result.product.note);
            setsetting_type(result.settings);
            setquantity_detail(result.quantities);
            setproduct_status(result.product?.current_stage);
            setwork_history(result.work_history);
        }
        setpage_loading(false);
    }

    const get_status = (id) => {
        var status = 'office';
        let idx = workTypes.findIndex((wt) => wt.id == id);

        if (idx > -1) {
            status = workTypes[idx].work_name;
        }

        return status;
    }

    const update_pechchaki = (val) => {
        if (!val) {
            let txt = 'Are you sure to not add 1 grm for pech and chaki'
            if (window.confirm(txt) == true) {
                setcasting_list([]);
                setpech_chaki(false);
            }
        } else {
            setpech_chaki(true);
        }
    }

    const casting_status = () => {
        return (
            <div className="daj-casting-data">
                {/* <div className="daj-casting-data-con">
                    <span className="daj-casting-data-txt">Net Weight. ( grm )</span>
                    <input className="daj-casting-data-inp" type="text" value={net_weight} onChange={(e) => { setnet_weight(e.target.value) }} />
                </div> */}
                {product_data?.current_karigar_id == 0 &&
                    <div className="daj-casting-data-con">
                        <span className="daj-casting-data-txt">Karigar Rate</span>
                        <input className="daj-casting-data-inp" type="text" value={price_rate} onChange={(e) => { setprice_rate(e.target.value) }} />
                    </div>
                }
                {grm_product.includes(product_data?.category_id) &&
                    <label className="daj-product-pechchaki-track" htmlFor="daj-product-pechchaki-data">
                        <input className='daj-product-quantity-track-inp' id="daj-product-pechchaki-data" type="checkbox" checked={pech_chaki} onChange={(e) => { update_pechchaki(e.target.checked) }} />
                        <span className='daj-product-quantity-track-txt'>Add Pech & chaki</span>
                    </label>
                }
                <div className="daj-product-quantity-track">
                    <span className='daj-product-quantity-track-txt'>Quantity</span>
                    <input className='daj-product-quantity-track-inp' type="text" value={product_quantity} onChange={(e) => { setproduct_quantity(e.target.value) }} />
                </div>
                {quantity_data()}
                <div className="daj-product-select-box">
                    <span className='daj-product-box-txt'>Select Box</span>
                    <input className='daj-product-box-inp' type="text" onFocus={() => setboxInp_focus(true)} value={select_box} onChange={(e) => { setselect_box(e.target.value) }} />
                    {boxInp_focus &&
                        <div className="daj-product-box-list">
                            {boxes.filter((box) =>
                                (box?.name.toLocaleLowerCase().includes(select_box.toLocaleLowerCase())) &&
                                (box?.type == 'casting')
                            ).map((box) => {
                                return (
                                    <span className="daj-product-box-opt" onClick={() => { setselect_box(box?.name); setboxInp_focus(false); }}>{box?.name}</span>
                                );
                            })}
                        </div>
                    }
                </div>
            </div>
        );
    }

    const quantity_data = () => {
        return (
            <div className="daj-casting-weight-quantity">
                {product_quantity > 0 && Array.from({ length: product_quantity }).map((val, index) => {
                    return (
                        <div className="daj-casting-weight-value" key={index}>
                            <span>{index + 1}</span>
                            <input type="text" value={quantity_array?.[index] ? quantity_array[index] : ''} onChange={(e) => casting_qua_handle(index, e.target.value)} />
                            <input type="text" value={note_array?.[index] ? note_array[index] : ''} onChange={(e) => casting_note_handle(index, e.target.value)} />
                        </div>
                    );
                })
                }
            </div>
        );
    }

    const casting_qua_handle = (index, val) => {
        let current_val = [...quantity_array];

        current_val[index] = val;
        setquantity_array(current_val);
    }

    const casting_note_handle = (index, val) => {
        let current_val = [...note_array];

        current_val[index] = val;
        setnote_array(current_val);
    }

    const gilet_status = () => {
        return (
            <div className="daj-casting-data">
                <div className="daj-casting-data-con">
                    {grm_product.includes(product_data?.category_id) &&
                        <label className="daj-product-pechchaki-track" htmlFor="daj-product-pechchaki-data">
                            <input className='daj-product-quantity-track-inp' id="daj-product-pechchaki-data" type="checkbox" checked={pech_chaki} onChange={(e) => { update_pechchaki(e.target.checked) }} />
                            <span className='daj-product-quantity-track-txt'>Add Pech & chaki</span>
                        </label>
                    }
                    <span className="daj-casting-data-txt">Gross Weight. ( grm )</span>
                    <input className="daj-casting-data-inp" type="text" value={gross_weight} onChange={(e) => { setgross_weight(e.target.value) }} />
                </div>
                {product_data?.current_karigar_id == 0 &&
                    <div className="daj-casting-data-con">
                        <span className="daj-casting-data-txt">Karigar Rate</span>
                        <input className="daj-casting-data-inp" type="text" value={price_rate} onChange={(e) => { setprice_rate(e.target.value) }} />
                    </div>
                }
                <select className="" value={gilet_type} onChange={(e) => { setgilet_type(e.target.value) }}>
                    {settingTypes?.length > 0 && settingTypes.map((setting) => {
                        if (gilet_array.includes(setting.id)) {
                            return (
                                <option value={setting.id}>{setting.name}</option>
                            );
                        }
                    })}
                </select>
            </div>
        );
    }

    const setting_status = () => {
        return (
            <div className="daj-setting-data">
                <div className="daj-setting-data-con">
                    <span className="daj-setting-data-header">Setting Details</span>
                    <div className="daj-setting-data-body">
                        {setting_type?.length > 0 &&
                            setting_type.map((setting, index) => {
                                let exclud_array = [14, 15, 16];

                                if (!(exclud_array.includes(setting?.id))) {
                                    let checked_val = setting?.checked;
                                    return (
                                        <div className="daj-setting-data-option" key={index}>
                                            <input className="daj-setting-data-box" type="checkbox" id={"daj-setting-data-option" + setting.name} checked={checked_val} onChange={(e) => settingHandler(setting?.id, e.target.checked, 'checked')} />
                                            <label className="daj-setting-data-txt" htmlFor={"daj-setting-data-option" + setting.name}>{setting.name}</label>
                                            <input className="daj-setting-data-inp" type="text" value={setting?.quantity} onChange={(e) => settingHandler(setting?.id, e.target.value, 'value')} />
                                            {(product_data?.current_karigar_id == 0 || setting?.id == 4 || setting?.id == 17 || setting?.id == 18) &&
                                                <input className="daj-setting-data-rate" type="text" value={setting?.rate} onChange={(e) => settingHandler(setting?.id, e.target.value, 'rate')} />
                                            }
                                        </div>
                                    );
                                }
                            })
                        }
                    </div>
                </div>
            </div>
        );
    }

    const settingHandler = (id, value, type) => {
        let old_data = [...setting_type];
        let idx = old_data.findIndex((data) => data?.id == id);

        if (idx > -1) {
            if (type == 'value') {
                Object.assign(old_data[idx], { 'quantity': value });
            } else if (type == 'checked') {
                Object.assign(old_data[idx], { 'checked': value });
            } else if (type == 'rate') {
                Object.assign(old_data[idx], { 'rate': value });
            }

            setsetting_type(old_data);
        }
    }

    const office_status = () => {
        return (
            <div className="daj-product-next-status">
                <div className="daj-product-status-header">
                    <div className="daj-product-status-con">
                        <span className="daj-product-status-con-txt">Select Status</span>
                        <select className="daj-status-con-drp" value={next_status} onChange={(e) => setnext_status(e.target.value)}>
                            <option value={0}>office</option>
                            {workTypes?.length > 0 && workTypes.map((wt, index) => {
                                if (wt.id == 1 && quantity_detail?.total_quantity > 0) {
                                    return;
                                }

                                return (
                                    <option value={wt.id} key={index}>{wt.work_name}</option>
                                );
                            })}
                            <option value={4}>Final Stage</option>
                        </select>
                    </div>
                    {next_status != 4 &&
                        <div className="daj-product-status-con">
                            <span className="daj-product-status-con-txt">Select karigar</span>
                            <select className="daj-status-con-drp" value={product_karigar} onChange={(e) => setproduct_karigar(e.target.value)}>
                                <option value=''>-- None --</option>
                                {karigars?.length > 0 && karigars.map((kgar, index) => {
                                    return (
                                        <option value={kgar.id} key={index}>{kgar.name}</option>
                                    );
                                })}
                            </select>
                        </div>
                    }
                </div>
                {/* {next_status == 2 && quantity_detail?.process_quantity == 0 &&
                    <div className="daj-product-quantity-track">
                        <span className='daj-product-quantity-track-txt'>Quantity</span>
                        <input className='daj-product-quantity-track-inp' type="number" value={product_quantity} onChange={(e) => { setproduct_quantity(e.target.value) }} max={quantity_detail?.casting_quantity} />
                    </div>
                } */}
            </div>
        );
    }

    const submit_product = async () => {
        setbtn_loading(true);

        const formData = new FormData();

        if (product_data?.current_stage == 1) {
            const allDefined = quantity_array.every(item => item !== undefined && item !== null && item !== 0);

            if (!allDefined) {
                alert('Enter All Net Weight');

                setbtn_loading(false);
                return;
            }

            // if (select_box == '') {
            //     alert('Select Box');

            //     setbtn_loading(false);
            //     return;
            // }

            if (product_data?.current_karigar_id == 0) {
                if (price_rate > 0) {
                    formData.append("rate", price_rate);
                } else {
                    alert('Enter Karigar Rate');

                    setbtn_loading(false);
                    return;
                }
            }

            let box_idx = boxes.findIndex((box) => box.name == select_box.trim())
            if (box_idx > -1) {
                formData.append("box_id", boxes[box_idx].id);
            } else {
                formData.append("new_box", select_box.trim());
            }

            // if (grm_product.includes(product_data?.category_id)) {
            if (grm_product.includes(product_data?.category_id) && pech_chaki) {
                let pr_quantity = [...quantity_array];
                let new_weight = pr_quantity.map(weight => (weight = Number(weight) + 1))
                // let new_weight = pr_quantity.map(weight => (weight = Number(weight)))

                formData.append("net_weight_array", JSON.stringify(new_weight));
            } else {
                formData.append("net_weight_array", JSON.stringify(quantity_array));
            }

            formData.append("note_array", JSON.stringify(note_array));
            // let netWeight = (Number(net_weight) / Number(product_quantity)).toFixed(2);

            formData.append("note", product_note);
            formData.append("box_type", 'casting');
            formData.append("sku", product_data?.sku);
            formData.append("quantity", product_quantity);
        }

        if (product_data?.current_stage == 3) {
            let current_net = product_data?.net_weight_with_margin;

            if (!gross_weight && gross_weight == 0) {
                alert('Enter gross Weight');

                setbtn_loading(false);
                return;
            }


            if ((Number(product_data?.net_weight_with_margin) - 1) >= Number(gross_weight)) {
                alert('gross Weight must be greater than Net weight : ' + current_net);

                setbtn_loading(false);
                return;
            }

            if (product_data?.current_karigar_id == 0) {
                if (price_rate > 0) {
                    formData.append("rate", price_rate);
                } else {
                    alert('Enter Karigar Rate');

                    setbtn_loading(false);
                    return;
                }
            }

            // if (grm_product.includes(product_data?.category_id)) {
            if (grm_product.includes(product_data?.category_id) && pech_chaki) {
                formData.append("weight", (Number(gross_weight) + 1));
                // formData.append("weight", (Number(gross_weight)));
            } else {
                formData.append("weight", gross_weight);
            }

            formData.append("setting_id", gilet_type);
        }

        if (product_data?.current_stage == 2) {
            const settingArray = setting_type.filter(item => item?.checked === true);

            formData.append("settings", JSON.stringify(settingArray));
        }

        formData.append("product_id", param.id);
        formData.append("work_type_id", product_data?.current_stage);

        let result = await api.post("/products/update-work.php", formData);
        if (result.data.status) {
            setcurrent_stage('next');
            if (result.data?.history) {
                setwork_history(result.data.history)
            }

            if (result.data?.quantities) {
                setquantity_detail(result.data.quantities);
            }

            if (product_data?.current_stage == 1) {
                if (result.data?.new_products?.length > 0) {
                    setcasting_list(result.data.new_products);
                }
            }

            setproduct_status('');
        } else {
            let message = result?.data?.message ? result?.data?.message : 'Something Wrong Product can not update';
            alert(message);
        }

        setproduct_quantity(0);
        setprice_rate(0);
        setbtn_loading(false);
    }

    const update_product = async () => {
        setbtn_loading(true);

        if (next_status == 4) {
            update_final_stage();

            return;
        }

        if (!product_karigar || !next_status) {
            alert('Enter all detail');

            setbtn_loading(false);
            return;
        }

        const formData = new FormData();
        if (next_status == 2 && quantity_detail?.process_quantity == 0) {

            // if (product_quantity <= 0) {
            //     alert('Enter Quantity');
            //     setbtn_loading(false);

            //     return;
            // }

            // formData.append("quantity", product_quantity);
        }

        formData.append("note", product_note);
        formData.append("product_id", param.id);
        formData.append("stage", next_status);
        formData.append("karigar_id", product_karigar);

        let result = await api.post("/products/update-status.php", formData);

        if (result.data.status) {
            naviget('/products/process');
        } else {
            let message = result?.data?.message ? result?.data?.message : 'Something Wrong Product can not update';
            alert(message);
        }

        setbtn_loading(false);
    }

    const update_final_stage = async () => {
        setbtn_loading(true);

        if (!product_image) {
            alert("Upload Final Image");
            setbtn_loading(false);
            return;
        }

        // if (select_box == '') {
        //     alert('Select Box');

        //     setbtn_loading(false);
        //     return;
        // }

        // if (select_color == '') {
        //     alert('Select Product Color');

        //     setbtn_loading(false);
        //     return;
        // }

        const formData = new FormData();
        formData.append("product_id", param.id);
        if (extra_cost > 0) {
            formData.append("extra_cost", extra_cost);
            formData.append("description", extra_cost_des);
        }

        let box_idx = boxes.findIndex((box) => box.name == select_box.trim())
        if (box_idx > -1) {
            formData.append("box_id", boxes[box_idx].id);
        } else {
            formData.append("new_box", select_box.trim());
        }

        if (final_gross) {
            formData.append("final_gross", final_gross);
        }

        formData.append("note", product_note);
        formData.append("box_type", 'final');
        formData.append("image", product_image);
        formData.append("lariya_pin_weight", lariya_pin);
        formData.append("color_id", select_color);

        let result = await api.post("/products/complete-product.php", formData);
        if (result.data.status) {
            naviget('/products/process');
            setbtn_loading(false);
        } else {
            let message = result?.data?.message ? result?.data?.message : 'Something Wrong Product can not update';
            alert(message);
            setbtn_loading(false);
        }

    }

    const print_slip = () => {
        const key = `scan_${Date.now()}_${Math.random()}`;
        sessionStorage.setItem(key, JSON.stringify(Array(product_data)));
        window.open(`/print/karigar?key=${key}`, "_blank");
    }

    const casting_noted = () => {
        let txt = 'Do You Note Down all SKU with Weight ??'
        if (window.confirm(txt) == true) {
            setcasting_list([]);
            naviget('/products/casting');
        }
    }

    const final_stage = () => {
        return (
            <div className="daj-product-final-stage">
                <div className="daj-product-final-image">
                    <span className="daj-final-image-header">Final Image</span>
                    <label className="daj-final-image-con" htmlFor="daj-product-final-image-inp"
                        onDragOver={(e) => { e.preventDefault(); }}
                        onDrop={(e) => {
                            e.preventDefault(); setproduct_image(e.dataTransfer.files[0]);
                        }}>
                        {product_image ?
                            <img src={window.URL.createObjectURL(product_image)} width='150px' />
                            :
                            <span className="daj-final-image-txt">Upload Image</span>
                        }
                        <input type="file" id="daj-product-final-image-inp" onChange={(e) => setproduct_image(e.target.files[0])} />
                    </label>
                </div>
                <div className="daj-product-extra-cost">
                    <div className="daj-extra-cost-con">
                        <span className="daj-extra-cost-val-txt">Extra Cost</span>
                        <input type="text" className="daj-extra-cost-val-inp" value={extra_cost} onChange={(e) => setextra_cost(e.target.value)} />
                    </div>
                    <div className="daj-extra-cost-con">
                        <span className="daj-product-extra-cost-txt">cost description</span>
                        <input type="text" className="daj-product-extra-cost-inp" value={extra_cost_des} onChange={(e) => setextra_cost_des(e.target.value)} />
                    </div>
                    <div className="daj-extra-cost-con">
                        <span className="daj-product-extra-cost-txt">Lariya / Pin</span>
                        <input type="text" className="daj-product-extra-cost-inp" value={lariya_pin} onChange={(e) => setlariya_pin(e.target.value)} />
                    </div>
                    <div className="daj-extra-cost-con">
                        <span className="daj-product-extra-cost-txt">Gross Weight</span>
                        <input type="text" className="daj-product-extra-cost-inp" value={final_gross} onChange={(e) => setfinal_gross(e.target.value)} />
                    </div>
                    {/* <div className="daj-product-color-select">
                        <span className="daj-product-extra-cost-txt">Product Color</span>
                        <select value={select_color} onChange={(e) => setselect_color(e.target.value)}>
                            <option value={''}>Null</option>
                            {colors?.length > 0 &&
                                colors.map((color) => {
                                    return (
                                        <option value={color?.id}>{color?.name}</option>
                                    );
                                })
                            }
                        </select>
                    </div> */}
                    <div className="daj-product-select-box">
                        <span className='daj-product-box-txt'>Select Box</span>
                        <input className='daj-product-box-inp' type="text" onFocus={() => setboxInp_focus(true)} value={select_box} onChange={(e) => { setselect_box(e.target.value) }} />
                        {boxInp_focus &&
                            <div className="daj-product-box-list">
                                {boxes.filter((box) =>
                                    (box?.name.toLocaleLowerCase().includes(select_box.toLocaleLowerCase())) &&
                                    (box?.type == 'final')
                                ).map((box) => {
                                    return (
                                        <span className="daj-product-box-opt" onClick={() => { setselect_box(box?.name); setboxInp_focus(false); }}>{box?.name}</span>
                                    );
                                })}
                            </div>
                        }
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="daj-edit-product-content">
            <h2 className="daj-edit-product-header">Edit product</h2>
            <div className='daj-product-content-form'>
                {page_loading ?
                    <span> Loading ... </span>
                    :
                    <>
                        <div className="daj-edit-product-body">
                            <div className="daj-product-body-top">
                                <div className="daj-product-history-img">
                                    <img className="daj-edit-product-image" src={product_data?.image} />
                                    <div className="daj-product-history">
                                        <h4 className="daj-edit-product-status">{get_status(product_status)}</h4>
                                        {work_history.length > 0 &&
                                            work_history.map((h_data, index) => {
                                                if (h_data?.weight && h_data?.weight > 0) {
                                                    return (
                                                        <div key={index} className="daj-product-history-con" >
                                                            <span>{h_data?.work_type + "   =>   "}</span>
                                                            <span>{h_data?.karigar}</span>
                                                            {h_data?.setting_type &&
                                                                <>
                                                                    <span>{"   =>   "}</span>
                                                                    <span>{h_data?.setting_type}</span>
                                                                </>
                                                            }
                                                        </div>
                                                    );
                                                }
                                            })
                                        }
                                    </div>
                                </div>
                            </div>
                            <div className="daj-edit-product-note">
                                <span className="daj-product-note-head">Note :</span>
                                <textarea className="daj-product-note-txt" value={product_note} onChange={(e) => setproduct_note(e.target.value)} />
                            </div>
                            <div className="daj-product-body-bottom">
                                {(product_data?.current_stage != 0 && product_status && current_stage == 'update') &&
                                    <div className="daj-product-status-header">
                                        <div className="daj-product-status-con">
                                            <span className="daj-product-status-con-txt">Select Status</span>
                                            <select className="daj-status-con-drp" value={product_data?.current_stage} disabled>
                                                <option value={0}>office</option>
                                                {workTypes?.length > 0 && workTypes.map((wt, index) => {
                                                    return (
                                                        <option value={wt.id} key={index}>{wt.work_name}</option>
                                                    );
                                                })}
                                                <option value={4}>Final Stage</option>
                                            </select>
                                        </div>
                                        <div className="daj-product-status-con">
                                            <span className="daj-product-status-con-txt">Select karigar</span>
                                            <select className="daj-status-con-drp" value={product_data?.current_karigar_id} disabled>
                                                <option value=''>-- None --</option>
                                                {karigars?.length > 0 && karigars.map((kgar, index) => {
                                                    return (
                                                        <option value={kgar.id} key={index}>{kgar.name}</option>
                                                    );
                                                })}
                                            </select>
                                        </div>
                                    </div>
                                }
                                <hr />
                                <div className="daj-product-status-body">
                                    {(product_status == 0 || product_status == null || current_stage == 'next') && office_status()}
                                    {product_status == 1 && casting_status()}
                                    {product_status == 2 && setting_status()}
                                    {product_status == 3 && gilet_status()}
                                    {next_status == 4 && final_stage()}
                                </div>
                            </div>
                        </div>
                        <div className='daj-edit-product-footer'>
                            <button className='daj-product-submit' to={'/print/karigar/' + param?.id} target='_blank' onClick={() => print_slip()}>Print</button>
                            {btn_loading ?
                                <button className='daj-product-submit'>Loading ...</button>
                                :
                                ((product_status == 0 || product_status == null || current_stage == 'next') ?
                                    <button className='daj-product-submit' onClick={() => { update_product() }}>Submit</button>
                                    :
                                    <button className='daj-product-submit' onClick={() => { submit_product() }}>Next</button>
                                )
                            }
                        </div>
                    </>
                }
            </div>
            {casting_list.length > 0 &&
                <div className="daj-show-casting-list">
                    <div className="daj-show-new-products">
                        <table className="daj-show-new-product-table">
                            <thead>
                                <tr>
                                    <td>ID</td>
                                    <td>SKU</td>
                                    <td>Net Weight</td>
                                </tr>
                            </thead>
                            <tbody>
                                {casting_list.map((new_pr) => {
                                    return (
                                        <tr>
                                            <td>{new_pr?.id}</td>
                                            <td>{new_pr?.sku + '-' + new_pr?.production_run}</td>
                                            <td>{new_pr?.net_weight}</td>
                                        </tr>

                                    );
                                })
                                }
                            </tbody>
                        </table>
                        <button className="daj-close-casting-list" onClick={() => casting_noted()}>Close</button>
                    </div>
                </div>
            }
        </div>
    );
}

export default EditProduct;