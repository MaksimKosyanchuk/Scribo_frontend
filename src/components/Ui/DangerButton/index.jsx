import "./DangerButton.scss";

export default function DangerButton({ children, onClick, type = "button", className = "", isActive = false }) {
  return (
    <button className={`danger_button ${isActive ? "danger_button_active" : ""} app-transition ${className}`} onClick={onClick} type={type}>
      {children}
    </button>
  );
}
