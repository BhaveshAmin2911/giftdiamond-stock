import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useLocation, useParams } from "react-router-dom";
import './BoxPrint.scss'

const BoxPrint = () => {

    const param = useParams();
    const [product_list, setproduct_list] = useState([]);
    const [get_print, setget_print] = useState(false);
    const [box_name, setbox_name] = useState('');
    const [side_view, setside_view] = useState(true);

    useEffect(() => {
        get_product();
    }, [])

    useEffect(() => {
        if (get_print) {
            window.print();
        }

        setget_print(false);
    }, [get_print])

    const get_product = async () => {

        const formData = new FormData();
        formData.append("box_id", param.id);

        const res = await api.post("/boxes/box-product.php", formData);

        if (res?.data?.status) {
            let products = res?.data?.data;
            setbox_name(res?.data?.box_name)
            let total_count = products?.length > 0 ? products.length : 0;

            setside_view(total_count);
            // if (total_count > 4) {
            // } else {
            //     setside_view(total_count);
            // }

            setproduct_list(products);

            // setTimeout(() => {
            //     setget_print(true);
            // }, 1000);
        }
    }

    return (
        <div className="daj-box-lable-print">
            <div className={`daj-box-print-imgs daj-box-front-${side_view < 9 ? side_view : 8}`}>
                <div className="daj-box-pront-left-con">
                    {side_view <= 4 &&
                        <div className="daj-box-name-top">{box_name}</div>
                    }
                    <div className="daj-box-print-imgs-con">
                        {product_list.map((product, rowIndex) => {
                            return (
                                <img src={product?.image} key={rowIndex} />
                            );
                        })
                        }
                    </div>
                </div>
                {side_view > 4 &&
                    <div className="daj-box-pront-right-con">
                        <div className="daj-box-name-right">{box_name.slice(0, 2)}</div>
                        <div className="daj-box-name-right">{box_name.slice(2, 4)}</div>
                        <div className="daj-box-name-right">{box_name.slice(4)}</div>
                    </div>
                }
            </div>
            <div className={`daj-box-print-imgs daj-box-side-${side_view}`}>
                <div className="daj-box-pront-left-con">
                    {side_view <= 8 &&
                        <div className="daj-box-name-top">{box_name}</div>
                    }
                    <div className="daj-box-print-imgs-con">
                        {product_list.map((product, rowIndex) => {
                            return (
                                <img src={product?.image} key={rowIndex} />
                            );
                        })
                        }
                    </div>
                </div>
                {side_view > 8 &&
                    <div className="daj-box-pront-right-con">
                        <div className="daj-box-name-right">{box_name.slice(0, 2)}</div>
                        <div className="daj-box-name-right">{box_name.slice(2, 4)}</div>
                        <div className="daj-box-name-right">{box_name.slice(4)}</div>
                    </div>
                }
            </div>
        </div >
    );
}

export default BoxPrint;