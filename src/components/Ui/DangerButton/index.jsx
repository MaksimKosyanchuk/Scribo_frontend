import "./DangerButton.scss";
import Loader from "../Loading";

export default function DangerButton({
    children,
    onClick,
    type = "button",
    className = "",
    isActive = false,
    isLoading = false,
    disabled = false,
}) {
    const isDisabled = disabled || isLoading;

    return (
        <button
            className={`danger_button app-transition ${className} ${isActive ? "danger_button_active" : ""} ${isLoading ? "danger_button_loading" : ""} ${isDisabled && !isLoading ? "danger_button_disabled" : ""}`}
            onClick={isDisabled ? undefined : onClick}
            type={type}
            disabled={isDisabled}
        >
            <Loader size={20} />
            {children}
        </button>
    );
}
