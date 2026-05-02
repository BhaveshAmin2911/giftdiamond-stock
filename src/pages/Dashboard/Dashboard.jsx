import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import './Dashboard.scss'

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
        <div className="daj-main-dashbaord-con">
            <div className="daj-dashbaord-morning">
                <h4 className="daj-dashbaord-morning-head">{time}</h4>
                <span className="daj-dashbaord-user-data">{userData.user.name}</span>
            </div>
            <div className="daj-dashbaord-quote-con">
                <h4 className="daj-dashbaord-quote-text">{userData?.quote?.text}</h4>
                <span className="daj-dashbaord-quote-auth">{'- ' + userData?.quote?.author}</span>
            </div>
        </div>
    );
}

export default Dashboard;