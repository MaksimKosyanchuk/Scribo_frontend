import { memo } from "react";
import "./ChipButton.scss";

const ChipButton = memo(({ isActive = false, onClick, children, className = "" }) => (
    <button
        type="button"
        className={`chip_button app-transition ${isActive ? "chip_button_active" : ""} ${className}`}
        onClick={onClick}
    >
        {typeof children === "string" || typeof children === "number" ? <p>{children}</p> : children}
    </button>
));

export default ChipButton;
