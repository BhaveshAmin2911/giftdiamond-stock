import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import './Dashboard.css'

const Dashboard = () => {
    const [time, settime] = useState('Good Morning');
    const userData = useSelector(state => state.auth.data);

    useEffect(() => {
        get_current_time()
    }, [])

    const get_current_time = () => {
        const hour = new Date().getHours();

        if (hour < 12) {
            settime("Good Morning 🌅");
        } else if (hour < 17) {
            settime("Good Afternoon ☀️");
        } else {
            settime("Good Evening 🌙");
        }
    }

    return (
        <div className="dashboard-page">

            <div className="dashboard-container">

                <div className="dashboard-header">

                    <p className="dashboard-welcome">
                        Welcome Back
                    </p>

                    <h1 className="dashboard-title">
                        {time}
                    </h1>

                    <p className="dashboard-user">
                        {userData?.user?.name}
                    </p>

                </div>

                <div className="dashboard-quote-wrapper">

                    <div className="dashboard-quote-line"></div>

                    <div className="dashboard-quote-card">

                        <p className="dashboard-quote-text">
                            "{userData?.quote?.text}"
                        </p>

                        <p className="dashboard-quote-author">
                            — {userData?.quote?.author}
                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Dashboard;