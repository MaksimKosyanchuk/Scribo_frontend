import "./PrimaryButton.scss";
import Loader from "../Loading";

export default function PrimaryButton({ children, onClick, type = "button", className = "", is_loading = false, disabled = false, id }) {
  return (
    <button id={id} className={`primary_button app-transition ${className} ${is_loading ? 'primary_button_loading' : ''}${disabled ? 'primary_button_disabled' : ''}`} onClick={ is_loading || disabled ? () => {} : onClick} type={type} disabled={disabled}>
      {is_loading && <Loader size={20}/>}
      <p style={{ visibility: is_loading ? 'hidden' : 'visible' }}>
        {children}
      </p>
    </button>
  );
}