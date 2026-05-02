import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import api from "../../api/axios";
import './ViewProduct.scss'
import UpdateImage from "../../reusable/UpdateImage/UpdateImage";
import BoxUpdate from "../../reusable/BoxUpdate/BoxUpdate";

const ViewProduct = () => {
    const param = useParams();

    const workTypes = useSelector(state => state.workTypes.list);

    const [product_data, setproduct_data] = useState();
    const [extra_cost, setextra_cost] = useState();
    const [product_status, setproduct_status] = useState();
    const [product_quantity, setproduct_quantity] = useState();
    const [work_history, setwork_history] = useState([]);
    const [page_loading, setpage_loading] = useState(false);
    const [image_update, setimage_update] = useState(false);
    const [box_update, setbox_update] = useState();
    const [note_update, setnote_update] = useState();
    const [note_val, setnote_val] = useState('');
    const [urgent_checkbox, seturgent_checkbox] = useState(false);
    const [urgent_time, seturgent_time] = useState();
    const [deadline_update, setdeadline_update] = useState(false);

    useEffect(() => {
        get_product();
    }, [])

    const get_product = async () => {
        setpage_loading(true);
        const formData = new FormData();
        formData.append("product_id", param.id);

        let result = await api.post("/products/get-product.php", formData)
            .then((res) => { return res.data });
        if (result.status) {

            setproduct_data(result.product);
            setnote_val(result.product?.note);
            seturgent_checkbox(result.product?.urgent == 1 ? true : false);
            seturgent_time(result.product?.urgent_time);
            setextra_cost(result.extra_costs)
            setproduct_quantity(result.quantities);
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

    const update_new_image = (img) => {
        let new_data = Object.assign({}, product_data, { 'image': img });
        setproduct_data(new_data);
    }

    const update_new_box = (box_name) => {
        let new_data = Object.assign({}, product_data, { [box_update + '_box_id']: box_name });
        setproduct_data(new_data);
        setbox_update();
    }

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    }

    const update_note = async () => {
        const formData = new FormData();
        let update_array = [{ 'id': param.id, 'note': note_val }]
        formData.append("products", JSON.stringify(update_array));

        await api.post("/products/update-note.php", formData);
    }

    const update_deadline = async (type) => {
        const formData = new FormData();
        formData.append("product_id", param.id);

        if (type == 'remove') {
            let text = 'Are you sure to remove deadline from this product ?';

            if (window.confirm(text) == true) {
                formData.append("urgent", false);
                formData.append("urgent_time", '0000-00-00');
                setdeadline_update(false);
                seturgent_checkbox(false);
            }
        } else {
            formData.append("urgent", urgent_checkbox);
            formData.append("urgent_time", urgent_time);
            setdeadline_update(false);
        }

        await api.post("/products/update-urgent.php", formData);

    }

    return (
        <div className="daj-view-product-content">
            <h2 className="daj-view-product-header">View product</h2>
            <div className='daj-product-content-form'>
                {page_loading ?
                    <span> Loading ... </span>
                    :
                    <>
                        <div className="daj-view-product-body">
                            <div className="daj-product-body-top">
                                <div className="daj-product-image-con">
                                    <div className="daj-product-image-inner">
                                        <img className="daj-view-product-image" src={product_data?.image} />
                                        <button className="daj-product-image-update-btn" onClick={() => setimage_update(!image_update)}>Update Image</button>
                                    </div>
                                    {image_update &&
                                        <div className="daj-product-image-update-con">
                                            <UpdateImage id={product_data?.id} close_popup={() => { setimage_update(false) }} new_img={(val) => { update_new_image(val) }} />
                                        </div>
                                    }
                                </div>
                                <div className="daj-product-current-data">
                                    <div className="daj-product-current-detail">
                                        <span className="daj-product-detail-label">Status : </span>
                                        <span className="daj-product-detail-value">{product_data?.status}</span>
                                    </div>
                                    <div className="daj-product-current-detail">
                                        <span className="daj-product-detail-label">Current Stage : </span>
                                        <span className="daj-product-detail-value">{product_data?.current_stage ? product_data.current_stage : 'Office'}</span>
                                    </div>
                                    <div className="daj-product-current-detail">
                                        <span className="daj-product-detail-label">Karigar : </span>
                                        <span className="daj-product-detail-value">{product_data?.current_karigar_id ? product_data.current_karigar_id : 'Null'}</span>
                                    </div>
                                    <div className="daj-product-current-detail daj-casting-box">
                                        <span className="daj-product-detail-label">Casting Box : </span>
                                        <span className="daj-product-detail-value">{product_data?.casting_box_id ? product_data.casting_box_id : '-'}</span>
                                        {box_update == 'casting' ?
                                            <BoxUpdate type={'casting'} id={product_data?.id} new_box={(val) => update_new_box(val)} close_popup={() => { setbox_update() }} />
                                            :
                                            <span className="daj-product-detail-editor" onClick={() => setbox_update('casting')}>Edit</span>
                                        }
                                    </div>
                                    <div className="daj-product-current-detail daj-final-box">
                                        <span className="daj-product-detail-label">Final Box : </span>
                                        <span className="daj-product-detail-value">{product_data?.final_box_id ? product_data.final_box_id : '-'}</span>
                                        {box_update == 'final' ?
                                            <BoxUpdate type={'final'} id={product_data?.id} new_box={(val) => update_new_box(val)} close_popup={() => { setbox_update() }} />
                                            :
                                            <span className="daj-product-detail-editor" onClick={() => setbox_update('final')}>Edit</span>
                                        }
                                    </div>
                                    <div className="daj-product-current-detail daj-note-editor">
                                        <span className="daj-product-detail-label">Note : </span>
                                        {note_update ?
                                            <>
                                                <textarea value={note_val} onChange={(e) => setnote_val(e.target.value)} />
                                                <button className="daj-update-note-submit" onClick={() => update_note()}>{'>'}</button>
                                            </>
                                            :
                                            <>
                                                <span className="daj-product-detail-value">{note_val ? note_val : '-'}</span>
                                                <span className="daj-product-detail-editor" onClick={() => setnote_update(true)}>Edit</span>
                                            </>
                                        }
                                    </div>
                                    {urgent_checkbox ?
                                        <div className="daj-product-current-detail daj-deadline-editor">
                                            <span className="daj-product-detail-label">Product Deadline : </span>
                                            {deadline_update ?
                                                <>
                                                    <input type="date" value={(urgent_time)} onChange={(e) => seturgent_time(e.target.value)} />
                                                    <button className="daj-product-urgent-timeline" onClick={() => update_deadline()}>{'>'}</button>
                                                </>
                                                :
                                                <>
                                                    <span className="daj-product-detail-value">{formatDateTime(urgent_time)}</span>
                                                    <span className="daj-product-detail-editor" onClick={() => setdeadline_update(true)}>Edit</span>
                                                    <span className="daj-product-detail-editor" onClick={() => update_deadline('remove')}>Remove</span>
                                                </>
                                            }
                                        </div>
                                        :
                                        <button onClick={() => { seturgent_checkbox(true); setdeadline_update(true) }}>Add Dead Line</button>
                                    }
                                </div>
                            </div>
                            <div className="daj-product-body-center">
                                <div className="daj-product-history">
                                    <div className="daj-product-details">
                                        <table className="daj-product-history-con">
                                            <tbody>
                                                <tr>
                                                    <td>SKU : </td>
                                                    <td>{product_data?.sku + "-" + product_data?.production_run}</td>
                                                </tr>
                                                <tr>
                                                    <td>Status : </td>
                                                    <td>{get_status(product_status)}</td>
                                                </tr>
                                                <tr>
                                                    {product_data?.type == "AD" ?
                                                        <>
                                                            <td>Weight : </td>
                                                            <td>{Number(product_data?.net_weight).toFixed(2) + 0 + ' grm'}</td>
                                                        </>
                                                        :
                                                        <>
                                                            <td>Net Weight : </td>
                                                            <td>{product_data?.net_weight_with_margin.toFixed(2) + 0 + ' grm'}</td>
                                                        </>
                                                    }
                                                </tr>
                                                {product_data?.type != "AD" &&
                                                    <tr>
                                                        <td>Gross Weight : </td>
                                                        <td>{product_data?.gross_weight + ' grm'}</td>
                                                    </tr>
                                                }
                                                <tr>
                                                    <td>Labour : </td>
                                                    {product_data?.type == "AD" ?
                                                        <td>{'₹ ' + (Math.round((product_data?.total_labour) / 10) * 10)}</td>
                                                        :
                                                        <td>{'₹ ' + (Math.round((product_data?.total_labour_with_margin) / 10) * 10)}</td>
                                                    }
                                                </tr>
                                            </tbody>
                                        </table>
                                        <table className="daj-product-history-con">
                                            <tbody>
                                                <tr>
                                                    <td>Casting Quantity : </td>
                                                    <td>{product_quantity?.casting_quantity}</td>
                                                </tr>
                                                <tr>
                                                    <td>Process Quantity : </td>
                                                    <td>{product_quantity?.process_quantity}</td>
                                                </tr>
                                                <tr>
                                                    <td>Ready Quantity : </td>
                                                    <td>{product_quantity?.ready_quantity}</td>
                                                </tr>
                                                <tr>
                                                    <td>Total Quantity  : </td>
                                                    <td>{product_quantity?.total_quantity}</td>
                                                </tr>
                                                <tr>
                                                    <td>Sold Out : </td>
                                                    <td>{product_quantity?.sold_quantity}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <div className="daj-product-body-bottom">
                                <table className="daj-product-history-con" >
                                    <thead>
                                        <tr>
                                            <td>Work Type</td>
                                            <td>Karigar Name</td>
                                            <td>Setting Type</td>
                                            <td>Weight / psc</td>
                                            <td>Amount</td>
                                        </tr>
                                    </thead>
                                    {work_history.length > 0 &&
                                        work_history.map((h_data, index) => {
                                            if (h_data?.weight && h_data?.weight > 0) {
                                                return (
                                                    <tr key={index}>
                                                        <td>{h_data?.work_type}</td>
                                                        <td>{h_data?.karigar}</td>
                                                        {h_data?.setting_type ?
                                                            <>
                                                                <td>{h_data?.setting_type}</td>
                                                                <td>{h_data?.weight}</td>
                                                                <td>{h_data?.amount}</td>
                                                            </>
                                                            :
                                                            <>
                                                                <td>{'---'}</td>
                                                                <td>{h_data?.weight}</td>
                                                                <td>{h_data?.amount}</td>
                                                            </>
                                                        }
                                                    </tr>
                                                );
                                            }
                                        })
                                    }
                                    <hr />
                                    {extra_cost?.length > 0 &&
                                        extra_cost.map((ex_cost) => {
                                            return (
                                                <tr>
                                                    <td>Extra Cost</td>
                                                    <td colSpan={3}>{ex_cost.description}</td>
                                                    <td>{ex_cost.amount}</td>
                                                </tr>
                                            );
                                        })
                                    }
                                    <tr>
                                        <td colSpan={4}>Total Cost</td>
                                        <td>{product_data?.total_labour}</td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                    </>
                }
            </div>
        </div >
    );
}

export default ViewProduct;