import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { getUsers } from "../../api/users.api";

import "./Admins.scss";

import { ReactComponent as ThreeDotsIcon } from "../../assets/svg/three-dots.svg";
import { ReactComponent as RedirectIcon } from "../../assets/svg/redirect.svg";

import RoleBadge from "../../components/RoleBadge/index";
import UserBadge from "../../components/UserBadge/index";
import Tooltip from "../../components/Ui/Tooltip";
import Popup from "../../components/Ui/Popup";

const AdminsPage = () => {
    const [admins, setAdmins] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        
        const fetchAdmins = async () => {
            const result = await getUsers([{ is_admin: true }]);
            
            if(result.status) {
                setAdmins(result.data);
            }
        }
        
        fetchAdmins();
    },[])

    useEffect(() => {
    }, [admins])


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
                                    <Popup body={[
                                        {
                                            title: "Перейти в профиль",
                                            icon: <RedirectIcon />,
                                            onClick: () => { navigate(`/users/${admin?.nick_name}`) }
                                        }
                                    ]}>
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

export default AdminsPage