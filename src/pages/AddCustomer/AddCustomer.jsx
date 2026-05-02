import { useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import "./AddCustomer.scss";
import { setCustomers } from "../../store/slices/customerSlice";
import { useDispatch } from "react-redux";

const AddCustomer = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [form, setForm] = useState({
        name: "",
        number: "",
        address: ""
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("name", form.name);
        formData.append("number", form.number);
        formData.append("address", form.address);

        const res = await api.post("/customers/create.php", formData);

        if (res.data.status) {
            if (res.data?.customer_list?.length > 0) {
                dispatch(setCustomers(res.data.customer_list));
                window.close();
            }

        } else {
            let message = res?.data?.message ? res.data.message : 'Something Wrong !';
            alert(res.data.message);
        }
    };

    return (
        <>
            <div className="daj-user-register-page">
                <form onSubmit={handleSubmit} className="daj-user-register-form" >
                    <h2 className="daj-register-form-header">Add New Customer</h2>
                    <div className="daj-register-form-body">
                        <input type="text" placeholder="Name" className="daj-register-form-inp" onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        <input type="text" placeholder="Mobile Number" className="daj-register-form-inp" onChange={(e) => setForm({ ...form, number: e.target.value })} />
                        <textarea placeholder="Address" rows='5' className="daj-register-form-inp" onChange={(e) => setForm({ ...form, address: e.target.value })} />
                        <button type="submit" className="daj-register-form-submit">Submit</button>
                    </div>
                </form>
            </div>
        </>
    );
}

export default AddCustomer;