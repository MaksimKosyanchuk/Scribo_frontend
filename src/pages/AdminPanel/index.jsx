import "./AdminPanel.scss";

import { ReactComponent as TagIcon } from "../../assets/svg/tag.svg";
import { ReactComponent as PeoplesIcon } from "../../assets/svg/peoples.svg";
import { ReactComponent as LogIcon } from "../../assets/svg/post.svg";

import { useNavigate } from "react-router-dom";
import { useContext, useEffect } from "react";

import { AppContext } from "../../App.js";

import SidebarPage from "../../components/SidebarPage/index";

import CategoriesPage from "./Categories.jsx";
import LogsPage from "./Logs.jsx";
import AdminsPage from "./Admins.jsx";

const AdminPanel = () => {
    const navigate = useNavigate();
    const { profile, profileLoading } = useContext(AppContext);

    useEffect(() => {
        if (!profileLoading && (!profile || !profile.is_admin)) {
            navigate("/");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profile, profileLoading]);

    const pages=[
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
        }
    ]

    return (
        <div className="admin_panel_page">

            <SidebarPage
                page_title={"Панель администратора"}
                pages={pages}
            />
        </div>
    )
}

export default AdminPanel