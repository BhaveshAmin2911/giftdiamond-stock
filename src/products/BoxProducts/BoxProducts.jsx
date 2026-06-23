import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useLocation, useNavigate } from "react-router-dom";
import './BoxProducts.scss';

const BoxProduct = () => {
    const navigator = useNavigate();
    const [select_box, setselect_box] = useState('');
    const [box_list, setbox_list] = useState([]);
    const [boxInp_focus, setboxInp_focus] = useState(false);

    useEffect(() => {
        getbox_list();
    }, [])

    const getbox_list = async () => {
        let result = await api.get("/boxes/list.php");

        if (result?.data?.status) {
            setbox_list(result?.data?.data);
        }
    }

    const submit_box = () => {
        let index = box_list.findIndex((data) => data.name == select_box);

        if (index > -1) {
            let id = box_list[index].id;

            window.open('/print/box/' + id, "_blank");
        }
    }

    return (
        <div className="daj-select-print-box">
            <div className="daj-product-select-box">
                <span className='daj-product-box-txt'>Select Box</span>
                <div className="daj-print-box-submit">
                    <input className='daj-product-box-inp' type="text" onFocus={() => setboxInp_focus(true)} value={select_box} onChange={(e) => { setselect_box(e.target.value) }} />
                    <span className="daj-box-submit-btn" onClick={() => submit_box()}>{'>'}</span>
                </div>
                {boxInp_focus &&
                    <div className="daj-product-box-list">
                        {box_list.filter((box) =>
                            (box?.name.toLocaleLowerCase().includes(select_box.toLocaleLowerCase()))
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

export default BoxProduct;