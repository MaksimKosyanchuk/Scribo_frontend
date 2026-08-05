import { Outlet } from "react-router-dom";

import "./DefaultContainer.scss"

const DefaultContainer = () => {
    
    return (
        <div className="default-container">
            <Outlet/>
        </div>
    );
}

export default DefaultContainer;
