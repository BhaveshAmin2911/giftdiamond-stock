import { useEffect, useRef, useState } from "react";
import api from "../../api/axios";
import { useLocation, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import './karigarPrint.scss'

const KarigarPrint = () => {
    const settingTypes = useSelector(state => state.settingTypes.list);

    let exclud_array = ['14', '15', '16', '6']
    let input_weight_array = ['2', '17']
    let input_color_array = ['2', '17', '5']

    const [product_list, setproduct_list] = useState([]);
    const [product_colors, setproduct_colors] = useState([]);
    const [product_weights, setproduct_weights] = useState([]);

    const product_ref = useRef();

    const params = new URLSearchParams(window.location.search);
    const key = params.get("key");

    useEffect(() => {
        const product_array = JSON.parse(sessionStorage.getItem(key));
        if (product_array?.length > 0) {
            setproduct_list(product_array);
            sessionStorage.removeItem(key);
        }

    }, [sessionStorage?.getItem(key)])

    useEffect(() => {

        const handleKeyDown = (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === "p") {
                handlePrintAttempt();
            }
        };

        const beforePrint = () => {
            handlePrintAttempt();
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("beforeprint", beforePrint);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("beforeprint", beforePrint);
        };

    }, []);

    useEffect(() => {
        product_ref.current = { 'color': product_colors, 'weight': product_weights };
    }, [product_colors, product_weights])

    const get_date = () => {
        const today = new Date();

        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();

        const formattedDate = `${day}-${month}-${year}`;

        return formattedDate;
    }

    const udpate_product = (id, setting_id, type, value) => {
        if (type == 'color') {
            var current_data = [...product_colors];
        } else if (type == 'weight') {
            var current_data = [...product_weights];
        }

        let index = current_data.findIndex((data) => data.id == id);

        if (index > -1) {
            let data_array = (current_data[index]?.data?.length > 0 ? [...current_data[index].data] : []);
            let inner_idx = data_array.findIndex((in_data) => in_data.id == setting_id);

            if (inner_idx > -1) {
                data_array[inner_idx].val = value;
            } else {
                let new_val = { 'id': setting_id, 'val': value }
                data_array.push(new_val);
            }

            current_data[index].data = data_array;
        } else {
            let new_obj = {
                'id': id,
                'data': [{ 'id': setting_id, 'val': value }]
            }

            current_data.push(new_obj);
        }

        if (type == 'color') {
            setproduct_colors(current_data);
        } else if (type == 'weight') {
            setproduct_weights(current_data);
        }
    }

    const handlePrintAttempt = async () => {
        let color_array = product_ref.current?.color?.length > 0 ? product_ref.current.color : [];
        let weight_array = product_ref.current?.weight?.length > 0 ? product_ref.current.weight : [];

        if (color_array?.length > 0) {
            let final_array = [];
            color_array.map((color) => {
                let id = color?.id;
                let color_txt = '';

                let data_array = color?.data?.length > 0 ? color?.data : [];
                data_array.map((data) => {
                    let idx = settingTypes.findIndex((s_data) => s_data.id == data.id);

                    if (idx > -1) {
                        var txt = '( ' + settingTypes[idx].name + '|' + data.val + ' )';
                        color_txt += txt;
                    }
                })

                final_array.push({ 'id': id, 'note': color_txt })
            })

            const formData = new FormData();
            formData.append("products", JSON.stringify(final_array));

            await api.post("/products/update-note.php", formData);
        }

        if (weight_array?.length > 0) {

            const formData = new FormData();
            formData.append("products", JSON.stringify(weight_array));

            await api.post("/setting-types/update-setting-list.php", formData);
        }
    }

    return (
        <div className="daj-print-karigar">
            {product_list.map((product, index) => {
                return (
                    <>
                        <div className="daj-print-karigar-con" key={index}>
                            <div className="daj-print-product-info">
                                <span className="daj-print-product-sku">{product?.sku + '-' + product?.production_run}</span>
                                <span className="daj-print-product-net">{product?.net_weight ? 'Net : ' + product.net_weight + ' grm' : ''}</span>
                                <img src={product?.image} />
                            </div>
                            <div className="daj-print-product-value">
                                <table className="daj-print-product-table" border="1">
                                    <tbody>
                                        <tr>
                                            <th>Setting</th>
                                            <th>Color</th>
                                            <th>Weight</th>
                                            <th>Piece</th>
                                        </tr>
                                        {settingTypes?.length > 0 && settingTypes.map((val, idx) => {

                                            if (product.note) {
                                                var color = '';

                                                const color_array = [...product.note.matchAll(/\((.*?)\)/g)].map(match => {
                                                    const [id, val] = match[1].split('|').map(v => v.trim());
                                                    return { id, val };
                                                });

                                                if (color_array.length > 0) {
                                                    let color_idx = color_array.findIndex((color) => color.id == val?.name);

                                                    if (color_idx > -1) {
                                                        color = color_array[color_idx]?.val;
                                                    }
                                                }
                                            }

                                            if (!exclud_array.includes(val?.id)) {

                                                let val_idx = product?.setting_quantities?.findIndex((data) => data?.setting_type_id == val?.id);
                                                var weight = '';

                                                if (val_idx > -1) {
                                                    weight = product?.setting_quantities[val_idx]?.quantity;
                                                }

                                                return (
                                                    <tr key={idx}>
                                                        <td>{val?.name}</td>
                                                        <td>{input_color_array.includes(val?.id) && <input type="text" className="daj-print-input" defaultValue={color} onChange={(e) => { udpate_product(product?.id, val?.id, 'color', e.target.value) }} />}</td>
                                                        <td>{input_weight_array.includes(val?.id) && <input type="text" className="daj-print-input" defaultValue={weight} onChange={(e) => { udpate_product(product?.id, val?.id, 'weight', e.target.value) }} />}</td>
                                                        <td></td>
                                                    </tr>
                                                );
                                            }

                                        })}
                                        <tr>
                                            <td colSpan={1}>Gross</td>
                                            <td colSpan={3}><input type="text" className="daj-gross-wt-input" /></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="daj-karigar-print-notice">
                                <span className="daj-print-product-date">{get_date()}</span>
                            </div>
                        </div>
                        <hr className="daj-karigar-print-separater" />
                    </>
                );
            })}
        </div>
    );
}

export default KarigarPrint;