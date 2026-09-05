import "./AppLayout.scss";

import { useContext, useEffect, useCallback, useRef } from "react";
import { AppContext } from "../../App";
import { useLocation } from "react-router-dom";

import { getProfile } from "../../api/profile.api";
import { trackVisit } from "../../api/analytics.api";
import { getAccessToken } from "../../api/http";

const SKIP_TRACKING = /^\/admin-panel/;

const AppLayout = ({ children }) => {
    const location = useLocation()
    const { profile, setProfile, setProfileLoading, authReady } = useContext(AppContext)
    const profileRef = useRef(profile)
    const requestIdRef = useRef(0)

    profileRef.current = profile

    const setProfileData = useCallback(async () => {
        const requestId = ++requestIdRef.current
        const silent = Boolean(profileRef.current)

        if (!silent) {
            setProfileLoading(true);
        }

        const result = await getProfile();

        if (requestId !== requestIdRef.current) {
            return
        }

        if (result.status) {
            setProfile(result.data);
        }
        else if (result.unauthorized || !getAccessToken()) {
            setProfile(null);
        }

        setProfileLoading(false);
    }, [setProfile, setProfileLoading]);

    useEffect(() => {
        if (!authReady) {
            return
        }

        document.body.scrollTo({
            top: 0,
            behavior: "smooth",
        });

        const path = location.pathname;
        setProfileData();

        if (!SKIP_TRACKING.test(path)) {
            trackVisit(path);
        }
    }, [location.pathname, location.search, setProfileData, authReady]);

     return (
        <div className="app-layout app-transition" id="app-layout">
            {children}
        </div>
    );
}

export default AppLayout;
