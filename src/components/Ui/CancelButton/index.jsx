import "./CancelButton.scss";
import CrossIcon from "../../../assets/svg/cross-icon.svg?react";

export default function CancelButton({ children, onClick, type = "button", className = "", is_active=false }) {
  return (
    <button className={`cancel_button ${is_active ? 'cancel_button_active' : ''} app-transition ${className}`} onClick={onClick} type={type}>
        <CrossIcon className="cancel_button_icon"/>
      {children}
    </button>
  );
}