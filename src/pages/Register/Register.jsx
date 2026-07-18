import { useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import "./Register.css";
import Select from "react-select";

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

    const roleOptions = [
        { value: "admin", label: "Admin" },
        { value: "manager", label: "Manager" },
        { value: "staff", label: "Staff" },
        { value: "customer", label: "Customer" },
        { value: "karigar", label: "Karigar" },
    ];
    const dajSelectStyle = {
        control: (base, state) => ({
            ...base,
            minHeight: "44px",
            borderRadius: "8px",
            borderColor: state.isFocused
                ? "var(--primary-color)"
                : "var(--border-color)",
            boxShadow: "none",
            backgroundColor: "var(--white-color)",
            "&:hover": {
                borderColor: "var(--primary-color)",
            },
        }),

        menu: (base) => ({
            ...base,
            zIndex: 9999,
        }),

        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected
                ? "var(--primary-color)"
                : state.isFocused
                    ? "var(--primary-light-color)"
                    : "var(--white-color)",
            color: state.isSelected
                ? "var(--white-color)"
                : "var(--text-color)",
            cursor: "pointer",
        }),

        singleValue: (base) => ({
            ...base,
            color: "var(--text-color)",
        }),

        placeholder: (base) => ({
            ...base,
            color: "var(--text-light-color)",
        }),
    };
    return (
        <div className="daj-register-page">
            <form onSubmit={handleSubmit} className="daj-register-form">
                <h2 className="daj-register-title">
                    Add New User
                </h2>

                <div className="daj-register-body">
                    <input
                        type="text"
                        placeholder="Name"
                        className="daj-register-input"
                        onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                        }
                    />

                    <input
                        type="text"
                        placeholder="User Name"
                        className="daj-register-input"
                        onChange={(e) =>
                            setForm({ ...form, email: e.target.value })
                        }
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        className="daj-register-input"
                        onChange={(e) =>
                            setForm({ ...form, password: e.target.value })
                        }
                    />

                    <Select
                        className="daj-register-react-select"
                        styles={dajSelectStyle}
                        options={roleOptions}
                        value={roleOptions.find(
                            (item) => item.value === form.role
                        )}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                role: e.value,
                            })
                        }
                        placeholder="Select Role"
                    />

                    <button
                        type="submit"
                        className="daj-btn-primary"
                    >
                        Create User
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Register;