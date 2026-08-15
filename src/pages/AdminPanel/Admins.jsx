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

const AdminsPage = () => {
    const [admins, setAdmins] = useState([]);
    const { profile } = useContext(AppContext);

    const navigate = useNavigate();

    useEffect(() => {
        
        const fetchAdmins = async () => {
            const result = await getUsers();
            
            if(result.status) {
                result.data.sort((a, b) => {
                    const roleOrder = ["tech_admin", "admin", "moderator", "author", "user"];
                    return roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role);
                })
                setAdmins(result.data);
            }
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
        const body = [
            {
                title: "Перейти в профиль",
                icon: <RedirectIcon />,
                onClick: () => { navigate(`/users/${user?.nick_name}`) }
            }
        ]
        if(profile && profile.role_management) {
            for(const role of profile.role_management) {
                if(role !== user.role) {
                    body.push({
                        title: `Выдать роль ${role}`,
                        icon: getRoleIcon(role),
                        onClick: () => { updateRole(user._id, role).then((result) => {
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
                        }) }
                    })
                }
            }
        }
        
        return body;
    }



    return (
        <div className="admin_panel_content_amdins_page">
            {
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