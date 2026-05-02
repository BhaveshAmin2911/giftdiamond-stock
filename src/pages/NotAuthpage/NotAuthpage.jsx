import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const NotAuthpage = () => {
    const location = useLocation();

    useEffect(() => {
        if (window.location.pathname != '/not-auth') {
            window.location.pathname = '/not-auth'
        }
    }, [])

    return (
        <div>
            You Are Not Authorize to this page Please Contenct Admin
        </div>
    );
}

export default NotAuthpage;