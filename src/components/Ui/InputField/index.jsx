import { forwardRef } from "react";

import "./InputField.scss";

import ConfirmedIcon from "../../../assets/svg/confirmed-icon.svg?react";

const Input = forwardRef(
(
  {
    className,
    onChange,
    onFocus,
    onMouseDown,
    onKeyDown,
    error,
    type,
    value,
    placeholder,
    required = false,
    confirmed = false,
    isMultiline = false,
    multilineRows = 1,
    length = 120,
    ...props
  },
  ref
) => {
  
  const InputComponent = isMultiline ? "textarea" : "input";

  return (
    <div className="input_field_wrapper">
      <InputComponent
          ref={ref}
          className={`input_field ${error ? "incorrect_field" : ""} app-transition ${className ?? ""} ${confirmed ? "confirmed" : ""}`}
          type={type}
          onChange={onChange}
          onFocus={onFocus}
          onMouseDown={onMouseDown}
          onKeyDown={onKeyDown}
          required={required}
          placeholder={placeholder}
          rows={multilineRows}
          wrap="hard"
          maxLength={length}
          value={value}
          readOnly={confirmed}
          {...props}
      />

      {confirmed && (
          <ConfirmedIcon className="input_confirmed_icon app-transition" />
      )}
    </div>
  );
});

export default Input;
