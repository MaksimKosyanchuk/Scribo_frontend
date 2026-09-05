import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";

import { getUsers, updateRole } from "../../api/users.api";

import { AppContext } from "../../App.jsx";

import "./Admins.scss";

import ThreeDotsIcon from "../../assets/svg/three-dots.svg?react";
import RedirectIcon from "../../assets/svg/redirect.svg?react";
import UserIcon from "../../assets/svg/profile.svg?react";
import AuthorIcon from "../../assets/svg/author.svg?react";
import ModeratorIcon from "../../assets/svg/shield-security.svg?react";
import AdminIcon from "../../assets/svg/protected-icon.svg?react";
import TechAdminIcon from "../../assets/svg/tech-admin.svg?react";

import RoleBadge from "../../components/RoleBadge/index";
import UserBadge from "../../components/UserBadge/index";
import Tooltip from "../../components/Ui/Tooltip";
import Popup from "../../components/Ui/Popup";
import Loading from "../../components/Ui/Loading";

const ROLE_ORDER = ["tech_admin", "admin", "moderator", "author", "user"];

const ROLE_LABELS = {
    user: "Пользователь",
    author: "Автор",
    moderator: "Модератор",
    admin: "Администратор",
    tech_admin: "Технический администратор",
};

const roleLabel = (role) => ROLE_LABELS[role] ?? role;

const AdminsPage = () => {
    const [admins, setAdmins] = useState([]);
    const [ isLoading, setIsLoading ] = useState(true);
    const { profile } = useContext(AppContext);

    const navigate = useNavigate();

    useEffect(() => {
        setIsLoading(true);
        const fetchAdmins = async () => {
            const result = await getUsers();
            
            if(result.status) {
                result.data.sort((a, b) => {
                    const roleOrder = ["tech_admin", "admin", "moderator", "author", "user"];
                    return roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role);
                })
                setAdmins(result.data);
            }
            setIsLoading(false);
        }
        
        fetchAdmins();
    },[])

    useEffect(() => {
    }, [admins])

    const getRoleIcon = (role) => {
        switch(role) {
            case "user":
                return <UserIcon />
            case "author":
                return <AuthorIcon />
            case "moderator":
                return <ModeratorIcon />
            case "admin":
                return <AdminIcon />
            case "tech_admin":
                return <TechAdminIcon />
            default:
                return null;
        }
    }

    const getPopupBody = (user) => {
        const profileSection = [
            {
                title: "Перейти в профиль",
                icon: <RedirectIcon />,
                onClick: () => { navigate(`/users/${user?.nick_name}`) }
            }
        ]

        const allowedRoles = new Set(profile?.role_management || []);

        if (allowedRoles.size === 0) {
            return [profileSection]
        }

        const roleItems = ROLE_ORDER
            .filter((role) => role === user.role || allowedRoles.has(role))
            .map((role) => ({
                title: roleLabel(role),
                icon: getRoleIcon(role),
                isActive: role === user.role,
                onClick: () => {
                    if (role === user.role) {
                        return;
                    }

                    updateRole(user._id, role).then((result) => {
                        if(result.status) {
                            setAdmins((prevAdmins) => {
                                return prevAdmins.map((admin) => {
                                    if(admin._id === user._id) {
                                        return { ...admin, role: role }
                                    }
                                    return admin;
                                })
                            })
                        }
                    })
                }
            }))

        if (roleItems.length === 0) {
            return [profileSection]
        }

        return [
            profileSection,
            [
                {
                    type: "dropdown",
                    title: "Выдать роль",
                    icon: getRoleIcon(user.role) ?? <UserIcon />,
                    valueLabel: roleLabel(user.role),
                    items: roleItems,
                }
            ]
        ]
    }



    return (
        <div className="admin_panel_content_amdins_page">
            {   
                isLoading ? 
                <Loading size={40} /> :
                admins.map((admin) => {
                    return (
                        <div className="admin_panel_content_amdins_page_item app-transition" key={admin._id}>
                            <div className="admin_panel_content_amdins_page_item_user">
                                <UserBadge data={admin} />
                            </div>
                            <div className="admin_panel_content_amdins_page_item_role">
                                <RoleBadge user={admin} />
                            </div>
                            <div className="admin_panel_content_amdins_page_item_actions">
                                <Tooltip text="Дополнительные действия">
                                    <Popup body={getPopupBody(admin)}>
                                        <ThreeDotsIcon className="app-transition" />
                                    </Popup>
                                </Tooltip>
                            </div>
                        </div>
                    )
                })
            }
        </div>
    )
}

export default AdminsPage;