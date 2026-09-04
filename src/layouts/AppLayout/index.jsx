import "./AppLayout.scss";

import { useContext, useEffect, useCallback } from "react";
import { AppContext } from "../../App";
import { useLocation } from "react-router-dom";

import { getProfile } from "../../api/profile.api";

const AppLayout = ({ children }) => {
    const location = useLocation()
    const { setProfile, setProfileLoading, authReady } = useContext(AppContext) 

    const setProfileData = useCallback(async () => {
        setProfileLoading(true);

        const result = await getProfile();

        if (result.status) {
            setProfile(result.data);
        }
        else {
            setProfile(null);
        }

        setProfileLoading(false);
    }, [setProfile, setProfileLoading]);

    useEffect(() => {
        if (!authReady) {
            return
        }

        setProfileData();

        document.body.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }, [location, setProfileData, authReady]);

     return (
        <div className="app-layout app-transition" id="app-layout">
            {children}
        </div>
    );
}

export default AppLayout;