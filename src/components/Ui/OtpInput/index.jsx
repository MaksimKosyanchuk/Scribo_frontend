import "./OtpInput.scss";

import { useRef } from "react";
import InputField from "../InputField";

const OtpInput = ({
    length = 6,
    value,
    onChange,
    error,
    onFocus,
}) => {
    const inputsRef = useRef([]);

    const handleChange = (e, index) => {
        const digits = e.target.value.replace(/\D/g, "");

        if (!digits) {
            const newValue = [...value];
            newValue[index] = "";
            onChange(newValue);
            return;
        }

        const newValue = [...value];

        digits
            .slice(0, length - index)
            .split("")
            .forEach((digit, i) => {
                newValue[index + i] = digit;
            });

        onChange(newValue);

        const nextIndex = Math.min(index + digits.length, length - 1);
        inputsRef.current[nextIndex]?.focus();
    };

    const handleKeyDown = (e, index) => {
        switch (e.key) {
            case "Backspace": {
                e.preventDefault();

                const newValue = [...value];

                if (newValue[index]) {
                    newValue[index] = "";
                    onChange(newValue);
                } else if (index > 0) {
                    inputsRef.current[index - 1]?.focus();

                    newValue[index - 1] = "";
                    onChange(newValue);
                }

                break;
            }

            case "Delete": {
                e.preventDefault();

                const newValue = [...value];
                newValue[index] = "";
                onChange(newValue);
                break;
            }

            case "ArrowLeft":
                e.preventDefault();
                if (index > 0) {
                    inputsRef.current[index - 1]?.focus();
                }
                break;

            case "ArrowRight":
                e.preventDefault();
                if (index < length - 1) {
                    inputsRef.current[index + 1]?.focus();
                }
                break;

            case "Home":
                e.preventDefault();
                inputsRef.current[0]?.focus();
                break;

            case "End":
                e.preventDefault();
                inputsRef.current[length - 1]?.focus();
                break;

            default:
                break;
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();

        const pasted = e.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, length);

        if (!pasted) return;

        const newValue = Array(length).fill("");

        pasted.split("").forEach((digit, index) => {
            newValue[index] = digit;
        });

        onChange(newValue);

        const last = Math.min(pasted.length - 1, length - 1);
        inputsRef.current[last]?.focus();
    };

    return (
        <>
            {value.map((digit, index) => (
                <InputField
                    key={index}
                    ref={(el) => (inputsRef.current[index] = el)}
                    className="otp_input"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={length}
                    value={digit}
                    error={error}
                    placeholder=""
                    onFocus={(e) => {
                        e.target.select();
                        onFocus?.(e);
                    }}
                    onPaste={handlePaste}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                />
            ))}
        </>
    );
}

export default OtpInput;