import "./ActionButton.scss";

export default function ActionButton({ children, onClick, type = "button", className = "", disabled = false }) {
  return (
    <button className={`action_button app-transition ${className} ${disabled ? 'disabled' : ''}`} onClick={ disabled ? null : onClick} type={type}>
      {children}
    </button>
  );
}