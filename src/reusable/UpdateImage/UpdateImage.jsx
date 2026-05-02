import { useState } from 'react';
import './UpdateImage.scss';
import api from '../../api/axios';

const UpdateImage = (props) => {
    const [p_image, setp_image] = useState();
    const [loading, setloading] = useState(false)

    const submit_image = async () => {
        setloading(true);
        const formData = new FormData();
        formData.append("product_id", props?.id);
        formData.append("image", p_image);

        let result = await api.post("/products/update-image.php", formData)
            .then((res) => { return res.data });
        if (result?.status) {
            props.new_img(result?.image)
        } else {
            alert('Image Update Fail !!')
        }

        setloading(false);
        props.close_popup();
    }

    return (
        <div className='daj-product-img-updater'>
            <label
                className='daj-update-img-outer'
                htmlFor='daj-product-update-img-inp'
                onDragOver={(e) => { e.preventDefault(); }}
                onDrop={(e) => {
                    e.preventDefault(); setp_image(e.dataTransfer.files[0]);
                }}>
                {p_image ?
                    <img src={window.URL.createObjectURL(p_image)} width='150px' />
                    :
                    <span className="daj-img-placeholder">Upload New Image</span>
                }
                <input id='daj-product-update-img-inp' type='file' onChange={(e) => setp_image(e.target.files[0])} />
            </label>
            {loading ?
                <button className='daj-product-image-submit-btn'>Loading ...</button>
                :
                <button className='daj-product-image-submit-btn' onClick={() => submit_image()}>Submit</button>
            }
        </div>
    );
}

export default UpdateImage;