import "./InputField.scss";
import { ReactComponent as WarningIcon } from "../../assets/svg/warning-icon.svg"

const Input = ({ className, onChange, onFocus, error, type, value, input_label, placeholder, required=false, is_multiline = false, multiline_rows = 1, length = 120 }) => {
  
  const InputComponent = is_multiline ? 'textarea' : 'input';

  return (
    <label className='input_field_label'>
      <div className={"input"}>
        <span>{`${input_label ? input_label + ":" :''}`}</span>
        <InputComponent
          className={`input_field ${error ? "incorrect_field" : ""} app-transition ${className?? ""}`}
          type={type}
          onChange={onChange}
          onFocus={onFocus}
          required={required}
          placeholder={placeholder}
          rows={multiline_rows} wrap="hard" maxLength={length}
          value={value}
          />
        </div>
      {
        <div className={`input_field_label_error_message ${error ? "show" : ""}`}>
            <WarningIcon className='input_field_label_error_message_logo'/>
            <p>
              {error}
            </p>
        </div>
      }
      </label>
  );
}

export default Input;