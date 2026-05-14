import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import "./Login.scss";
import { useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { loadMasterData } from "../../store/services/masterDataService";

function Login() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [loading, setloading] = useState(false);
    // const [searchParams] = useSearchParams();

    const [form, setForm] = useState({
        email: "",
        password: "",
        remember: false
    });

    useEffect(() => {
        const token = localStorage.getItem("daj-token");

        if (token) {
            navigate("/");
        }
    }, []);

    // useEffect(() => {
    //     const token = localStorage.getItem("daj-token");
    //     const magicToken = searchParams.get("token");

    //     if (token) {
    //         navigate("/");
    //         return;
    //     }

    //     if (magicToken) {
    //         magicLogin(magicToken);
    //     }

    // }, []);

    const magicLogin = async (token) => {
        try {
            const formData = new FormData();
            formData.append("token", token);

            const res = await api.post("/auth/magic-login.php", formData);

            if (res.data.status) {

                localStorage.setItem("daj-token", res.data.data.token);
                localStorage.setItem("daj-user", JSON.stringify(res.data.data));

                loadMasterData(dispatch);

                navigate("/");

            } else {
                alert(res.data.message);
            }

        } catch (error) {
            alert("Magic login failed");
        }
    };

    const handleSubmit = async (e) => {
        setloading(true);
        e.preventDefault();

        try {
            const res = await api.post("/auth/login.php", form);

            if (res.data.status) {
                localStorage.setItem("daj-token", res.data.data.token);
                localStorage.setItem("daj-user", JSON.stringify(res.data.data));

                loadMasterData(dispatch);

                navigate("/");
            } else {
                alert(res.data.message);
            }
        } catch (error) {
            alert("Login failed");
        }

        setloading(false);
    };

    return (
        <div className="daj-login-page">
            <form onSubmit={handleSubmit} className="daj-login-form" >
                <h2 className="daj-login-form-header">Login</h2>
                <div className="daj-login-form-body">
                    <input type="text" placeholder="User Name" className="daj-login-form-inp" onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    <input type="password" placeholder="Password" className="daj-login-form-inp" onChange={(e) => setForm({ ...form, password: e.target.value })} />
                    <label className="daj-login-remeber-me">
                        <input type="checkbox" className="daj-login-remeber-inp" onChange={(e) => setForm({ ...form, remember: e.target.checked })} />
                        <span className="daj-login-remeber-txt">Remember Me</span>
                    </label>
                    <button type="submit" className="daj-login-form-submit">{loading ? 'Loading ... ' : 'Login'}</button>
                </div>
            </form>
        </div>
    );
}

export default Login;