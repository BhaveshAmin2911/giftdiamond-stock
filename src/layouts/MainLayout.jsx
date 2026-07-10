import { Outlet, Link, useLocation } from "react-router-dom";
import './MainLayout.css';
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { FaUser } from "react-icons/fa";
import { IoMdMenu } from "react-icons/io";
import { Tooltip } from "react-tooltip";
import { FaAlignJustify } from "react-icons/fa";


function MainLayout() {

    const [user_data, setuser_data] = useState();
    const [menu_open, setmenu_open] = useState(false);

    const location = useLocation();
    const userData = useSelector(state => state.auth.data);
    const [tooltipPlace, setTooltipPlace] = useState("left");


    useEffect(() => {
        setuser_data(userData?.user);
    }, [userData])

    useEffect(() => {
        const updateTooltipPlace = () => {
            if (window.innerWidth < 768) {
                setTooltipPlace("bottom");
            } else {
                setTooltipPlace("left");
            }
        };

        updateTooltipPlace();

        window.addEventListener("resize", updateTooltipPlace);

        return () => window.removeEventListener("resize", updateTooltipPlace);
    }, []);

    let menu_array = [
        { 'path': '/register', 'name': 'Add Users', 'access': ['admin'] },
        { 'path': '/products/process', 'name': 'Process List', 'access': ['admin', 'manager', 'staff', 'karigar'] },
        { 'path': '/export-product', 'name': 'Export', 'access': ['admin', 'manager', 'staff'] },
        { 'path': '/product/scan', 'name': 'Scan with Gun', 'access': ['admin', 'manager', 'staff'] },
        { 'path': '/product/catalog', 'name': 'Catalog', 'access': ['admin', 'manager', 'staff', 'customer'] },
        { 'path': '/order', 'name': 'Order', 'access': ['admin', 'manager'] },
        { 'path': '/box-list', 'name': 'Print Box', 'access': ['admin', 'manager'] }
    ]

    const check_outer_clcik = (event) => {
        if (!event.target.closest('.daj-header-mobile-menu')) {
            setmenu_open(false);
        }
    }

    return (
        <div className="main-layout">

            <header className="main-header">

                <div className="main-header-container">

                    {/* Desktop Menu */}
                    <div className="desktop-menu">

                        {menu_array.map((route, idx) => {

                            if (location.pathname !== "/not-auth" || route.path === "/products/process") {

                                if (route.access.includes(user_data?.role)) {

                                    return (
                                        <Link
                                            key={idx}
                                            to={route.path}
                                            className={`menu-link ${location.pathname === route.path
                                                ? "menu-link-active"
                                                : ""
                                                }`}
                                        >
                                            {route.name}
                                        </Link>
                                    );
                                }
                            }

                            return null;

                        })}

                    </div>

                    {/* Mobile Menu */}

                    <div className="mobile-menu">

                        <button
                            className="mobile-menu-btn"
                            onClick={() => setmenu_open(!menu_open)}
                        >
                            {/* <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="28"
                                height="22"
                                fill="none"
                            >
                                <path
                                    d="M0 2h28M0 11h28M0 20h28"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                />
                            </svg> */}
                            <FaAlignJustify className="mobile-menu-icon" />
                        </button>

                        {menu_open && (

                            <div className="mobile-dropdown">

                                {menu_array.map((route, idx) => {

                                    if (location.pathname !== "/not-auth" || route.path === "/products/process") {

                                        if (route.access.includes(user_data?.role)) {

                                            return (
                                                <Link
                                                    key={idx}
                                                    to={route.path}
                                                    onClick={() => setmenu_open(false)}
                                                    className={`mobile-link ${location.pathname === route.path
                                                        ? "mobile-link-active"
                                                        : ""
                                                        }`}
                                                >
                                                    {route.name}
                                                </Link>
                                            );
                                        }
                                    }

                                    return null;

                                })}

                            </div>

                        )}

                    </div>

                    {/* User */}

                    <div className="user-section">

                        <div
                            data-tooltip-id="user-tooltip"
                            data-tooltip-content={userData?.user?.name}
                            className="user-avatar"

                        >

                            <FaUser className="user-icon" />

                        </div>

                        <button
                            className="logout-btn"
                            onClick={() => {
                                localStorage.clear();
                                window.location.href = "/";
                            }}
                        >
                            Logout
                        </button>

                    </div>

                </div>

            </header >

            <main className="main-body">
                <Outlet />
            </main>


            <Tooltip
                id="user-tooltip"
                place={tooltipPlace}
                className="user-tooltip"
            />
        </div >


    );
}

export default MainLayout;