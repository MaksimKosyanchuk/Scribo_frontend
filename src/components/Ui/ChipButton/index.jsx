import { memo } from "react";
import "./ChipButton.scss";

const ChipButton = memo(({ isActive = false, onClick, children, className = "", disabled = false }) => (
    <button
        type="button"
        className={`chip_button app-transition ${isActive ? "chip_button_active" : ""} ${disabled ? "chip_button_disabled" : ""} ${className}`}
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
    >
        {typeof children === "string" || typeof children === "number" ? <p>{children}</p> : children}
    </button>
));

export default ChipButton;
