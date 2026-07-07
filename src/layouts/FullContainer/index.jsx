import { Outlet } from "react-router-dom";

import "./FullContainer.scss"

const FullContainer = () => {
    return (
        <div className="full-container">
            <Outlet/>
        </div>
    );
}

export default FullContainer;
