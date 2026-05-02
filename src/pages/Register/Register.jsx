import { useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import "./Register.scss";

function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "staff"
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        const res = await api.post("/auth/register.php", form);

        if (res.data.status) {
            navigate("/login");
        } else {
            alert(res.data.message);
        }
    };

    return (
        <>
            <div className="daj-user-register-page">
                <form onSubmit={handleSubmit} className="daj-user-register-form" >
                    <h2 className="daj-register-form-header">Add New User</h2>
                    <div className="daj-register-form-body">
                        <input type="text" placeholder="Name" className="daj-register-form-inp" onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        <input type="text" placeholder="User Name" className="daj-register-form-inp" onChange={(e) => setForm({ ...form, email: e.target.value })} />
                        <input type="password" placeholder="Password" className="daj-register-form-inp" onChange={(e) => setForm({ ...form, password: e.target.value })} />
                        <select className="daj-register-user-type" onChange={(e) => setForm({ ...form, role: e.target.value })}>
                            <option value="admin">Admin</option>
                            <option value="manager">Manager</option>
                            <option value="staff">Staff</option>
                            <option value="customer">Customer</option>
                            <option value="karigar">Karigar</option>
                        </select>
                        <button type="submit" className="daj-register-form-submit">Create User</button>
                    </div>
                </form>
            </div>
        </>
    );
}

export default Register;