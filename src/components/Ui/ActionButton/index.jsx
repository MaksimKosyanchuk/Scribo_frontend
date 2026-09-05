import "./ActionButton.scss";
import Loader from "../Loading";

export default function ActionButton({ children, onClick, type = "button", className = "", disabled = false, isLoading = false }) {
  const isDisabled = disabled || isLoading;
  return (
    <button className={`action_button app-transition ${className} ${isDisabled ? "disabled" : ""} ${isLoading ? "action_button_loading" : ""}`} onClick={isDisabled ? undefined : onClick} type={type}>
      <Loader size={20}/>
      {children}
    </button>
  );
}
