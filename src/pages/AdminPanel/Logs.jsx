import { getAllLogs } from "../../api/logs.api";
import { getUsers } from "../../api/users.api";

import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";

import { AppContext } from "../../App";

import Loading from "../../components/Ui/Loading/index";

import "./Logs.scss";

const LogsPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showModalWindow, showToast } = useContext(AppContext);
    const [admins, setAdmins] = useState([]);

    useEffect(() => {
        const fetchAdmins = async () => {
            const result = await getUsers([{ is_admin: true }]);
            if(result.status) {
                setAdmins(result.data);
            }
        }

        const fetchLogs = async () => {
            const response = await getAllLogs();
            
            if(response.status) {
                const sortedLogs = [...response.data].sort(
                    (a, b) => new Date(b.date_time) - new Date(a.date_time)
                );

                setLogs(sortedLogs);
            }
            else {
                showToast({
                    type: "error",
                    message: response.message
                });
            }
            setLoading(false);
        };

        fetchLogs();
        fetchAdmins();
    }, []);

    useEffect(() => {
        console.log(admins)
    }, [admins]);

    const getLog = (log) => {
        switch(log.type) {
            case "update_post":
                return (
                    <div className="admin_panel_content_logs_page_content_log">
                        <p>Пользователь </p>
                        <Link to={`/users/${log.data.user}`}> { admins?.find((admin) => admin._id.toString() === log.data.user.toString())?.nick_name || log.data.user }  </Link>
                        <p>обновил</p>
                        <Link to={`/posts/${log.data.post}`}>пост [{log?.data?.post}]</Link>
                    </div>
                )
            case "create_post":
                return (
                    <div className="admin_panel_content_logs_page_content_log">
                        <p>Пользователь </p>
                        <Link to={`/users/${log.data.user}`}> { admins?.find((admin) => admin._id.toString() === log.data.user.toString())?.nick_name || log.data.user }  </Link>
                        <p>создал</p>
                        <Link to={`/posts/${log.data.post}`}>пост [{log?.data?.post}]</Link>
                    </div>
                )
            case "delete_post":
                return (
                    <div className="admin_panel_content_logs_page_content_log">
                        <p>Пользователь </p>
                        <Link to={`/users/${log.data.user}`}> { admins?.find((admin) => admin?._id?.toString() === log?.data?.user?.toString())?.nick_name || log.data.user }  </Link>
                        <p>удалил</p>
                        <Link to={`/posts/${log?.data?.post}`}>пост [{log?.data?.post}]</Link>
                    </div>
                )
            case "register":
                return (
                     <div className="admin_panel_content_logs_page_content_log">
                        <Link to={`/users/${log?.data?.user}`}>Пользователь</Link>
                        <p>зарегистрировался</p>
                    </div>
                )
            default:
                return (
                    <div>
                        <p>
                            {log.message}
                        </p>
                    </div>
                )
        }
    }

    return (
        <div className="admin_panel_content_logs_page">
            {
                loading ?
                    <Loading size={40}/>
                :
                    <div className="admin_panel_content_logs_page_content">
                        {
                            logs.map( (log) => {
                                return (
                                    <div key={log.id}>
                                        {
                                            getLog(log)
                                        }
                                    </div>
                                )
                            } )
                        }
                    </div>
            }
        </div>
    )
}

export default LogsPage