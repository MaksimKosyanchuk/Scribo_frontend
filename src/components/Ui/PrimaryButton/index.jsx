import "./PrimaryButton.scss";
import Loader from "../Loading";

export default function PrimaryButton({ children, onClick, type = "button", className = "", is_loading = false, disabled = false, id }) {
  const isDisabled = disabled || is_loading;

  return (
    <button
      id={id}
      className={`primary_button app-transition ${className} ${is_loading ? 'primary_button_loading' : ''}${disabled ? 'primary_button_disabled' : ''}`}
      onClick={isDisabled ? undefined : onClick}
      type={type}
      disabled={isDisabled}>
      <Loader size={20}/>
      {
          children
      }
    </button>
  );
}