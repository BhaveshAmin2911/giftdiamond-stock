import { useSelector } from "react-redux";
import './BoxUpdate.scss';
import { useState } from "react";
import api from "../../api/axios";

const BoxUpdate = (props) => {
    const boxes = useSelector(state => state.boxes.list);

    const [open_drp, setopen_drp] = useState(false);
    const [loading, setloading] = useState(false);
    const [new_box, setnew_box] = useState('');

    const update_box = async () => {
        setloading(true);
        setopen_drp(false);

        const formData = new FormData();
        formData.append("product_id", props?.id);
        formData.append("type", props?.type);

        let idx = boxes?.findIndex((box) => box.name.toLocaleLowerCase() == new_box.toLocaleLowerCase());
        if (idx > -1) {
            formData.append("box_id", boxes[idx].id);
        } else {
            formData.append("new_box", new_box);
        }

        let result = await api.post("/boxes/update-box.php", formData)
            .then((res) => { return res.data });
        if (result?.status) {
            props.new_box(result?.box_name)
        } else {
            alert('Boxes Update Fail !!')
        }

        setloading(false);
    }

    return (
        <div className="daj-product-box-update">
            <div className="daj-product-box-info">
                <input type="text" className="daj-product-box-info-inp" onFocus={() => setopen_drp(true)} onChange={(e) => { setnew_box(e.target.value) }} value={new_box} />
                {open_drp && new_box &&
                    <div className="daj-product-box-body">
                        {boxes?.length > 0 &&
                            boxes.filter((box) => (
                                box.name.toLocaleLowerCase().includes(new_box.toLocaleLowerCase())
                            )).map((box) => {
                                return (
                                    <option onClick={() => { setnew_box(box.name); setopen_drp(false); }} className="daj-product-box-opt">{box.name}</option>
                                );
                            })
                        }
                    </div>
                }
            </div>
            <button className="daj-product-box-update-btn" onClick={() => update_box()}>{">"}</button>
        </div>
    );
}

export default BoxUpdate;