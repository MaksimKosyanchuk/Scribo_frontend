import "./ActionButton.scss";
import Loader from "../Loading";

export default function ActionButton({ children, onClick, type = "button", className = "", disabled = false, is_loading = false }) {
  const isDisabled = disabled || is_loading;
  return (
    <button className={`action_button app-transition ${className} ${isDisabled ? 'disabled' : ''} ${is_loading ? 'action_button_loading' : ''}`} onClick={isDisabled ? undefined : onClick} type={type}>
      <Loader size={20}/>
      {
          children
      }
    </button>
  );
}