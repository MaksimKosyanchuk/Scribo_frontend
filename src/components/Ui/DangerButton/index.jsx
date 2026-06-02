import "./DangerButton.scss";

export default function DangerButton({ children, onClick, type = "button", className = "", is_active=false }) {
  return (
    <button className={`danger_button ${is_active ? 'danger_button_active' : ''} app-transition ${className}`} onClick={onClick} type={type}>
      {children}
    </button>
  );
}