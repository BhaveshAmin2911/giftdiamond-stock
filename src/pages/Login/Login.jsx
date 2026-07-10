import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import "./Login.css";
import { useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { loadMasterData } from "../../store/services/masterDataService";
import { FaUserCircle, FaEnvelope, FaLock } from "react-icons/fa";
import giftdiamond from "../../assests/img/GiftDiamond-logo.webp";
import { toast } from "react-toastify";

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
                toast.success("Login Successful");
                navigate("/");
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            alert("Login failed");
        }

        setloading(false);
    };

    return (
        <div className="login-page">

            <div className="login-bg-card"></div>

            <form
                onSubmit={handleSubmit}
                className="login-card">

                <div className="login-logo">
                    <div className="logo-circle">
                        <img
                            src={giftdiamond}
                            alt="Gift Diamond"
                            className="logo-img"
                        />
                    </div>
                </div>

                <div className="input-group">
                    <FaEnvelope className="input-icon" />

                    <input
                        type="text"
                        placeholder="Email ID"
                        className="login-input"
                        onChange={(e) =>
                            setForm({
                                ...form,
                                email: e.target.value,
                            })
                        }
                    />
                </div>

                <div className="input-group">
                    <FaLock className="input-icon" />

                    <input
                        type="password"
                        placeholder="Password"
                        className="login-input"
                        onChange={(e) =>
                            setForm({
                                ...form,
                                password: e.target.value,
                            })
                        }
                    />
                </div>

                <div className="remember-box">
                    <label className="remember-label">
                        <input
                            type="checkbox"
                            className="remember-checkbox"
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    remember: e.target.checked,
                                })
                            }
                        />
                        Remember me
                    </label>
                </div>

                <button
                    type="submit"
                    className="login-btn"
                    disabled={loading}
                >
                    {loading ? "Loading..." : "LOGIN"}
                </button>

            </form>

        </div>
    );
}

export default Login;