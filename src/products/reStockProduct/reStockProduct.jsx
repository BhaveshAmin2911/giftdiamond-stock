import { useState } from "react";
import api from "../../api/axios";
import './reStockProduct.scss'
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const ReStockProduct = () => {

    const karigars = useSelector(state => state.karigars.list);
    const navigate = useNavigate();

    const [product_data, setproduct_data] = useState();
    const [p_history, setp_history] = useState('');
    const [p_quantity, setp_quantity] = useState('');
    const [setting_karigar, setsetting_karigar] = useState('');
    const [reprocess_sku, setreprocess_sku] = useState('');
    const [re_process_quantity, setre_process_quantity] = useState(0);
    const [re_process_confirm, setre_process_confirm] = useState(false);
    const [customer_name, setcustomer_name] = useState('');

    const get_product = async (id) => {
        // setpage_loading(true);
        const formData = new FormData();
        formData.append("product_id", id);

        let result = await api.post("/products/get-product.php", formData)
            .then((res) => { return res.data });
        if (result.status) {

            setproduct_data(result.product);
            setp_history(result.work_history);
            setp_quantity(result.quantities);
        }
    }

    const check_casting = async () => {
        let sku = reprocess_sku ? reprocess_sku : '';

        const formData = new FormData();
        formData.append("sku", sku);

        let result = await api.post("/products/check-sku.php", formData);
        if (result.data?.status) {
            get_product(result.data?.product_id);
        } else {
            let message = result.data?.message ? result.data.message : 'something went wrong !'
            alert(message);
        }
    }

    const submit_reprocess = async () => {
        if (!setting_karigar) {
            alert('select karigar for process');

            return;
        }

        // if (re_process_quantity <= 0) {
        //     alert('Enter Quantity for re-process');

        //     return;
        // }

        const formData = new FormData();
        formData.append("product_id", product_data?.id);
        // formData.append("quantity", re_process_quantity);
        formData.append("current_karigar", setting_karigar);
        formData.append("customer_name", customer_name);

        let result = await api.post("/products/create-restock.php", formData);
        if (result?.data?.status) {
            let new_id = result?.data?.new_product_id;
            if (new_id) {
                navigate('/products/edit/' + new_id);
            } else {
                navigate('/products/process');

            }
        } else {
            let message = result?.data?.message ? result?.data?.message : 'Something Wrong Product can not update';
            alert(message);
        }
    }

    return (
        <div className='daj-reprocess-product'>
            <div className='daj-reprocess-sku'>
                <span>Enter SKU</span>
                <input type='text' value={reprocess_sku} onChange={(e) => { setreprocess_sku(e.target.value) }} />
                <button onClick={() => { check_casting() }}>{'>'}</button>
            </div>

            {product_data &&
                <div className="daj-product-body-bottom">
                    <div className="daj-product-old-data">
                        <img src={product_data?.image} width='100px' />
                        <div className="daj-product-quantity-data">
                            <div className="daj-product-quantity-val">
                                <span>Total Quantity : </span>
                                <span>{p_quantity?.total_quantity}</span>
                            </div>
                            <div className="daj-product-quantity-val">
                                <span>Casting Quantity : </span>
                                <span>{p_quantity?.casting_quantity}</span>
                            </div>
                            <div className="daj-product-quantity-val">
                                <span>In Process Quantity : </span>
                                <span>{p_quantity?.process_quantity}</span>
                            </div>
                            <div className="daj-product-quantity-val">
                                <span>Ready Stock Quantity : </span>
                                <span>{p_quantity?.ready_quantity}</span>
                            </div>
                        </div>
                    </div>
                    <table className="daj-product-history-con">
                        <thead>
                            <tr>
                                <td>Work Type</td>
                                <td>Karigar Name</td>
                                <td>Setting Type</td>
                                <td>Weight / psc</td>
                                <td>Amount</td>
                            </tr>
                        </thead>
                        <tbody>
                            {p_history.length > 0 &&
                                p_history.map((h_data, index) => {
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
                        </tbody>
                    </table>
                    <div className="daj-product-reprocess-footer">
                        {/* <div className="daj-setting-quantity">
                            <span>Enter Quantity</span>
                            <input type="text" value={re_process_quantity} onChange={(e) => setre_process_quantity(e.target.value)} />
                        </div> */}
                        <div className="daj-setting-karigar-con">
                            <span>Select Karigar</span>
                            <select className="daj-setting-karigar-drp" value={setting_karigar} onChange={(e) => setsetting_karigar(e.target.value)}>
                                <option value=''>-- None --</option>
                                {karigars?.length > 0 &&
                                    karigars.map((karigar) => {
                                        return (
                                            <option value={karigar?.id}>{karigar?.name}</option>
                                        );
                                    })
                                }
                            </select>
                        </div>
                        <div className="daj-product-customer">
                            <span>Customer Name ( optional )</span>
                            <input type="text" value={customer_name} onChange={(e) => setcustomer_name(e.target.value)} />
                        </div>
                        {/* <div className="daj-product-confirmation">
                            <input type='checkbox' id="daj_reprocess_confirm" checked={re_process_confirm} onChange={(e) => setre_process_confirm(e.target.checked)} />
                            <label htmlFor="daj_reprocess_confirm">Are you sure you want to start process ? </label>
                        </div> */}
                        <div className="daj-product-reprocess-submit">
                            <button onClick={() => submit_reprocess()}>Submit</button>
                        </div>
                    </div>
                </div>
            }
        </div>
    );
}

export default ReStockProduct;
