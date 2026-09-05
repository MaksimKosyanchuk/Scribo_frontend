import { memo } from "react";
import "./ChipButton.scss";

const ChipButton = memo(({ isActive = false, onClick, children, className = "", disabled = false, variant = "default" }) => (
    <button
        type="button"
        className={`chip_button app-transition ${variant === "quiet" ? "chip_button_quiet" : ""} ${isActive ? "chip_button_active" : ""} ${disabled ? "chip_button_disabled" : ""} ${className}`}
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
    >
        {typeof children === "string" || typeof children === "number" ? <p>{children}</p> : children}
    </button>
));

export default ChipButton;
