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

    return (
        <SidebarPage
            page_title={"Панель администратора"}
            pages={[
                {
                    title: "Категории",
                    icon: <TagIcon />,
                    content: <CategoriesPage /> 
                },
                {
                    title: "Администраторы",
                    icon: <PeoplesIcon />,
                    content: <AdminsPage />
                },
                {
                    title: "Логи",
                    icon: <LogIcon />,
                    content: <LogsPage />
                }
            ]}
        />
    )
}

export default AdminPanel