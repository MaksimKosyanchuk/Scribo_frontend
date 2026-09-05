import "./AdminPanel.scss";

import TagIcon from "../../assets/svg/tag.svg?react";
import PeoplesIcon from "../../assets/svg/peoples.svg?react";
import LogIcon from "../../assets/svg/post.svg?react";
import CommentIcon from "../../assets/svg/comment.svg?react";
import ChartIcon from "../../assets/svg/chart.svg?react";

import { useNavigate } from "react-router-dom";
import { useContext, useEffect } from "react";

import { AppContext } from "../../App.jsx";

import SidebarPage from "../../components/SidebarPage/index";

import CategoriesPage from "./Categories.jsx";
import LogsPage from "./Logs.jsx";
import AdminsPage from "./Admins.jsx";
import RequestsPage from "./Requests.jsx";
import DashboardPage from "./Dashboard.jsx";

const AdminPanel = () => {
    const navigate = useNavigate();
    const { profile, profileLoading } = useContext(AppContext);

    useEffect(() => {
        if (!profileLoading && (!["admin", "tech_admin"].includes(profile?.role))) {
            navigate("/");
        }

    }, [profile, profileLoading, navigate]);

    const pages=[
        {
            title: "Дашборд",
            key: "dashboard",
            icon: <ChartIcon />,
            content: <DashboardPage />
        },
        {
            title: "Категории",
            key: "categories",
            icon: <TagIcon />,
            content: <CategoriesPage /> 
        },
        {
            title: "Администраторы",
            key: "admins",
            icon: <PeoplesIcon />,
            content: <AdminsPage />
        },
        {
            title: "Логи",
            key: "logs",
            icon: <LogIcon />,
            content: <LogsPage />
        },
        {
            title: "Запросы",
            key: "requests",
            icon: <CommentIcon />,
            content: <RequestsPage />
        }
    ]

    return (
        <div className="admin_panel_page">

            <SidebarPage
                pageTitle={"Панель администратора"}
                pages={pages}
            />
        </div>
    )
}

export default AdminPanel