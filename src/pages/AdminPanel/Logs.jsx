import { getAllLogs } from "../../api/logs.api";
import { getUsers } from "../../api/users.api";

import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";

import { AppContext } from "../../App";

import { ReactComponent as UserIcon } from "../../assets/svg/profile-icon.svg";
import { ReactComponent as PostIcon } from "../../assets/svg/post.svg";
import { ReactComponent as CategoryIcon } from "../../assets/svg/tag.svg";

import Loading from "../../components/Ui/Loading";

import "./Logs.scss";

const LOG_TYPES = {
    create_post: {
        action: {
            label: "CREATE POST",
            className: "create"
        },
        entities: ["user", "post"]
    },

    update_post: {
        action: {
            label: "UPDATE POST",
            className: "update"
        },
        entities: ["user", "post"]
    },

    delete_post: {
        action: {
            label: "DELETE POST",
            className: "delete"
        },
        entities: ["user", "post"]
    },

    register: {
        action: {
            label: "REGISTER",
            className: "register"
        },
        entities: ["user"]
    },

    create_category: {
        action: {
            label: "CREATE CATEGORY",
            className: "create"
        },
        entities: ["user", "category"]
    },

    update_category: {
        action: {
            label: "UPDATE CATEGORY",
            className: "update"
        },
        entities: ["user", "category"]
    },

    delete_category: {
        action: {
            label: "DELETE CATEGORY",
            className: "delete"
        },
        entities: ["user", "category"]
    }
};

const LogAction = ({ action }) => {

    if (!action) return null;

    return (
        <div
            className={`logs_action logs_action_${action.className}`}
        >
            <span className="logs_action_dot" />

            <span>
                {action.label}
            </span>
        </div>
    );
};

const ENTITY_INFO = {
    user: {
        icon: UserIcon,
        className: "user",
        getLink: id => `/users/${id}`
    },

    post: {
        icon: PostIcon,
        className: "post",
        getLink: id => `/posts/${id}`
    },

    category: {
        icon: CategoryIcon,
        className: "category",
        getLink: () => "#"
    }
};

const LogEntity = ({
        type,
        id,
        title,
        onClick
    }) => {

    const entity = ENTITY_INFO[type];
    const Icon = entity.icon;

    if (!entity) return null;

    return (
        <div
            className={`logs_entity logs_entity_${entity.className}`}
            onClick={onClick}
        >
            <Icon className="logs_entity_icon"/>

            <span className="logs_entity_title">
                {title}
            </span>
        </div>
    );

};

const LogsPage = () => {
    const [logs, setLogs] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({
        type: null,
        id: null
    });

    const { showToast } = useContext(AppContext);

    useEffect(() => {
        const fetchData = async () => {

            const [logsResult] = await Promise.all([
                getAllLogs(),
            ]);

            if (!logsResult.status) {
                showToast({
                    type: "error",
                    message: logsResult.message
                });

                setLoading(false);
                return;
            }

            setLogs(
                [...logsResult.data].sort(
                    (a, b) =>
                        new Date(b.date_time) -
                        new Date(a.date_time)
                )
            );

            setLoading(false);

        };

        fetchData();

    }, []);
    
    useEffect(() => {
        const fetchUsers = async () => {
            const userIds = [
                ...new Set(
                    logs
                        .map(log => log.data?.user)
                        .filter(Boolean)
                )
            ];
    
            const usersResult = await getUsers(
                userIds.map(_id => ({ _id }))
            )

            if(usersResult.status) {
                setUsers(usersResult.data);
            }
        } 

        fetchUsers();
    },[logs]);

    const filteredLogs = logs.filter(log => {
        if (!filter.id) return true;

        switch (filter.type) {
            case "user":
                return log.data?.user === filter.id;

            case "post":
                return log.data?.post === filter.id;

            default:
                return true;
        }
    });

    const getUserName = (id) => {

        return (
            users.find(
                admin =>
                    admin._id.toString() === id?.toString()
            )?.nick_name || id
        );

    };

    const formatTime = (date) => {

        return new Date(date).toLocaleString("ru-RU", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });

    };

    const renderEntities = (log) => {

        const config = LOG_TYPES[log.type];

        if (!config) return null;

        return config.entities.map((entity) => {

            switch (entity) {

                case "user":

                    return (
                       <LogEntity
                            key="user"
                            type="user"
                            title={getUserName(log.data.user)}
                            id={log.data.user}
                            onClick={(e) => {
                                e.preventDefault();

                                setFilter({
                                    type: "user",
                                    id: log.data.user
                                });
                            }}
                        />
                    );

                case "post":

                    return (
                        <LogEntity
                            key="post"
                            type="post"
                            title={`Пост - ${log.data.post}`}
                            id={log.data.post}
                            onClick={(e) => {
                                e.preventDefault();

                                setFilter({
                                    type: "post",
                                    id: log.data.post
                                });
                            }}
                        />                        
                    );

                case "category":

                    return (
                        <LogEntity
                            key="category"
                            type="category"
                            title={
                                log.data.category ||
                                log.data.name ||
                                log.data.title ||
                                "Категория"
                            }
                            id={log.data.category}
                        />
                    );

                default:

                    return null;

            }

        });

    };

    const renderLog = (log) => {

        const config = LOG_TYPES[log.type];

        if (!config) {

            return (

                <div className="logs_row">

                    <div className="logs_unknown">

                        {log.message}

                    </div>

                    <div className="logs_time">

                        {formatTime(log.date_time)}

                    </div>

                </div>

            );

        }

        return (

            <div className="logs_row">

                <LogAction
                    action={config.action}
                />

                <div className="logs_entities">

                    {renderEntities(log)}

                </div>

                <div className="logs_time">

                    {formatTime(log.date_time)}

                </div>

            </div>

        );

    };

    if (loading) {

        return (
            <Loading size={40} />
        );

    }

    return (

        <div className="admin_panel_content_logs_page">

            <div className="admin_panel_content_logs_page_content">
                {
                    filter.id && (
                        <button
                            onClick={() =>
                                setFilter({
                                    type: null,
                                    id: null
                                })
                            }
                        >
                            Сбросить фильтр
                        </button>
                    )
                }
                {
                    filteredLogs.map(log => (

                        <div
                            key={log._id}
                            className="admin_panel_content_logs_page_content_log"
                        >

                            {renderLog(log)}

                        </div>

                    ))
                }

            </div>

        </div>

    );

};

export default LogsPage;