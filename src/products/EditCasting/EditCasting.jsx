import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import "./EditCasting.scss"
import { useSelector } from "react-redux";


const EditCasting = () => {
    const karigars = useSelector(state => state.karigars.list);

    const param = useParams();
    const navigate = useNavigate();
    const [product_karigar, setproduct_karigar] = useState();
    const [selected_list, setselected_list] = useState([]);
    const [product_data, setproduct_data] = useState();
    const [page_loading, setpage_loading] = useState(false);
    const [btn_loading, setbtn_loading] = useState(false);

    useEffect(() => {
        get_product();
    }, [])

    const get_product = async () => {
        setpage_loading(true);
        const formData = new FormData();
        formData.append("search", param.sku);

        let result = await api.post("/products/get-casting-sku.php", formData)
            .then((res) => { return res.data });
        if (result.status) {

            setproduct_data(result.data[0]);
        }
        setpage_loading(false);
    }

    const print_slip = () => {
        const key = `scan_${Date.now()}_${Math.random()}`;
        sessionStorage.setItem(key, JSON.stringify(selected_list));
        window.open(`/print/karigar?key=${key}`, "_blank");
    }

    const select_product = (product) => {
        let current_list = [...selected_list];
        let index = current_list.findIndex((p_id) => p_id.id == product.id);

        if (index > -1) {
            current_list.splice(index, 1);
        } else {
            current_list.push(product);
        }

        setselected_list(current_list);
    }

    const send_product = async () => {

        if (!product_karigar) {
            alert('select setting karigar !');

            return;
        }

        if (selected_list.length == 0) {
            alert('select products for setting !');

            return;
        }

        let id_array = selected_list.map(pr => pr.id)

        const formData = new FormData();
        formData.append("karigar_id", product_karigar);
        formData.append("product_ids", JSON.stringify(id_array));

        let result = await api.post("/products/start-process.php", formData);
        if (result.data.status) {
            navigate('/products/process');
        }
    }

    return (
        <div className="daj-edit-casting-content">
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
                                </div>
                            </div>
                            <div className="daj-product-body-bottom">
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
                                <div className="daj-product-child-con">
                                    <span>Product list</span>
                                    <table className="daj-product-child-list">
                                        <thead>
                                            <tr>
                                                <th>Select</th>
                                                <th>SKU</th>
                                                <th>Net Weight</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {product_data?.child_products?.length > 0 &&
                                                product_data.child_products.map((product, index) => {
                                                    let idx = selected_list.findIndex((sel_pr) => sel_pr.id == product?.id);
                                                    var checkbox = false;
                                                    if (idx > -1) {
                                                        checkbox = true;
                                                    }
                                                    return (
                                                        <tr className="daj-product-inner-detail" key={index}>
                                                            <td onClick={() => select_product(product)}>
                                                                <input type="checkbox" checked={checkbox} className="daj-inner-product-selection" />
                                                            </td>
                                                            <td>{product.sku + '-' + product.production_run}</td>
                                                            <td>{product.net_weight}</td>
                                                            <td>{product?.note}</td>
                                                        </tr>
                                                    );
                                                })
                                            }
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div className='daj-edit-product-footer'>
                            <button className='daj-product-submit' to={'/print/karigar/' + param?.id} target='_blank' onClick={() => print_slip()}>Print</button>
                            {btn_loading ?
                                <button className='daj-product-submit'>Loading ...</button>
                                :
                                <button className='daj-product-submit' onClick={() => { send_product() }}>Submit</button>
                            }
                        </div>
                    </>
                }
            </div>
        </div>
    );
}

export default EditCasting;