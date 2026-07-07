import { Outlet } from "react-router-dom";

import "./PageLayout.scss"

const AppLayout = () => {
    return (
        <div className="page-layout">
            <Outlet/>
        </div>
    )
}

export default AppLayout