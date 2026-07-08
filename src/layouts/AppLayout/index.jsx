import "./AppLayout.scss";

import { useContext, useEffect } from "react";
import { AppContext } from "../../App";
import { useLocation, useNavigate } from "react-router-dom";
import ActionButton from "../../components/Ui/ActionButton/index";

import { getProfile } from "../../api/profile.api";

const AppLayout = ({ children }) => {
    const location = useLocation()
    const { setProfile, setProfileLoading } = useContext(AppContext) 
    const { profile } = useContext(AppContext)
    const navigate = useNavigate()

    const setProfileData = async () => {
        setProfileLoading(true)

        const result = await getProfile();
        if(result.status) {
            setProfile(result.data);
        }

        setProfileLoading(false)
    };

    useEffect(() => {
        setProfileData();
        window.scrollTo(0, 0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location]);


    const handleClick = () => {
        navigate("/create-post")
    }

     return (
        <div className="app-layout app-transition" id="app-layout">
            {children}
            {
                (profile && profile.is_admin && location?.pathname !== "/create-post") ? 
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

export default AppLayout;