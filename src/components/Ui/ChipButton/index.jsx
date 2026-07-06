import { memo } from "react";
import "./ChipButton.scss";

const ChipButton = memo(({ is_active = false, onClick, children, className = "" }) => (
    <button 
        type="button" 
        className={`chip_button app-transition ${is_active ? "chip_button_active" : ""} ${className}`} 
        onClick={onClick}
    >
        {children}
    </button>
));

export default ChipButton;