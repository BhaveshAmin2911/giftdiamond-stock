import { Outlet, Link, useLocation } from "react-router-dom";
import './MainLayout.scss';
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";

function MainLayout() {

    const [user_data, setuser_data] = useState();
    const [menu_open, setmenu_open] = useState(false);

    const location = useLocation();
    const userData = useSelector(state => state.auth.data);

    useEffect(() => {
        setuser_data(userData?.user);
    }, [userData])

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
        <div className="daj-main-layout" onClick={(e) => { check_outer_clcik(e) }}>
            <div className="daj-header-layout">
                <div className="daj-header-menu">
                    {menu_array.map((route, idx) => {
                        if (location.pathname != '/not-auth' || route.path == '/products/process') {
                            if (route.access.includes(user_data?.role)) {
                                return (
                                    <Link to={route?.path} className={`daj-header-links ${location.pathname == route?.path ? 'daj-active-menu' : ''}`} key={idx}>{route?.name}</Link>
                                );
                            }
                        }
                    })}
                </div>
                <div className="daj-header-mobile-menu">
                    <span className="daj-header-mobile-menu-icon" onClick={() => { setmenu_open(!menu_open) }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="21" viewBox="0 0 32 21" fill="none">
                            <path d="M0 19.7499C0 19.1823 0.460152 18.7222 1.02778 18.7222H30.9722C31.5398 18.7222 32 19.1823 32 19.7499C32 20.3176 31.5398 20.7777 30.9722 20.7777H1.02778C0.460152 20.7777 0 20.3176 0 19.7499Z" fill="black" />
                            <path d="M0 10.4999C0 9.93232 0.460152 9.47217 1.02778 9.47217H30.9722C31.5398 9.47217 32 9.93232 32 10.4999C32 11.0676 31.5398 11.5277 30.9722 11.5277H1.02778C0.460152 11.5277 0 11.0676 0 10.4999Z" fill="black" />
                            <path d="M0 1.02778C0 0.460152 0.460152 0 1.02778 0H30.9722C31.5398 0 32 0.460152 32 1.02778C32 1.5954 31.5398 2.05556 30.9722 2.05556H1.02778C0.460152 2.05556 0 1.5954 0 1.02778Z" fill="black" />
                        </svg>
                    </span>
                    {menu_open &&
                        <div className="daj-mobile-menu-drp">
                            {menu_array.map((route, idx) => {
                                if (location.pathname != '/not-auth' || route.path == '/products/process') {
                                    if (route.access.includes(user_data?.role)) {
                                        return (
                                            <Link to={route?.path} className={`daj-header-links ${location.pathname == route?.path ? 'daj-active-menu' : ''}`} key={idx} onClick={() => setmenu_open(false)}>{route?.name}</Link>
                                        );
                                    }
                                }
                            })}
                        </div>
                    }
                </div>
                <div className="daj-user-data">
                    <div className="daj-user-data-info" title={userData?.user?.name} >
                        <span className="daj-user-info-tooltip">{userData?.user?.name}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 29 29" fill="none">
                            <path fillRule="evenodd" clipRule="evenodd" d="M14.5 3C11.2529 3 8.62062 5.6323 8.62062 8.87941C8.62062 12.1265 11.2529 14.7588 14.5 14.7588C17.7471 14.7588 20.3794 12.1265 20.3794 8.87941C20.3794 5.6323 17.7471 3 14.5 3ZM5.62062 8.87941C5.62062 3.97545 9.59607 0 14.5 0C19.404 0 23.3794 3.97545 23.3794 8.87941C23.3794 13.7834 19.404 17.7588 14.5 17.7588C9.59607 17.7588 5.62062 13.7834 5.62062 8.87941Z" fill="black" />
                            <path fillRule="evenodd" clipRule="evenodd" d="M3.7318 18.4906C6.12124 16.1012 9.36201 14.7588 12.7412 14.7588H16.2588C19.638 14.7588 22.8788 16.1012 25.2682 18.4906C27.6576 20.88 29 24.1208 29 27.5C29 28.3284 28.3284 29 27.5 29C26.6716 29 26 28.3284 26 27.5C26 24.9164 24.9737 22.4387 23.1469 20.6119C21.3201 18.7851 18.8423 17.7588 16.2588 17.7588H12.7412C10.1577 17.7588 7.67995 18.7851 5.85312 20.6119C4.0263 22.4387 3 24.9164 3 27.5C3 28.3284 2.32843 29 1.5 29C0.671573 29 0 28.3284 0 27.5C0 24.1208 1.34237 20.88 3.7318 18.4906Z" fill="black" />
                        </svg>
                    </div>
                    <button className="daj-header-logout" onClick={() => { localStorage.clear(); window.location.href = "/"; }} >
                        Logout
                    </button>
                </div>
            </div>
            <div className="daj-body">
                <Outlet />
            </div>
        </div>
    );
}

export default MainLayout;