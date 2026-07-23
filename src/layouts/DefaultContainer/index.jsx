import { Outlet } from "react-router-dom";

import "./DefaultContainer.scss"

import { useContext } from "react";
import { AppContext } from "../../App";
import { useLocation, useNavigate } from "react-router-dom";

import ActionButton from "../../components/Ui/ActionButton/index";

const DefaultContainer = () => {
    const location = useLocation()
    const { profile } = useContext(AppContext)
    const navigate = useNavigate()

    const handleClick = () => {
        navigate("/create-post")
    }
    
    return (
        <div className="default-container">
            <Outlet/>
            {
                (profile && profile.is_admin && location?.pathname !== "/create-post" && location?.pathname !== "/settings" && location?.pathname !== "/admin-panel") ? 
                <div className={"create_post_button"}>
                    <ActionButton className="blurred" onClick={handleClick}>
                        Создать новость
                    </ActionButton>
                </div>
                : <></>
            }
        </div>
    );
}

export default DefaultContainer;
