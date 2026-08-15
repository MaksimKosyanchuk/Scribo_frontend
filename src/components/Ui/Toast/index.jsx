import { useEffect, useRef, useState } from "react";
import "./Toast.scss";

const Toast = ({ toast, showToast }) => {
    const timerRef = useRef(null);
    const visibilityTimerRef = useRef(null);
    const exitTimerRef = useRef(null);

    const [isExiting, setIsExiting] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (!toast) {
            return;
        }

        setIsVisible(false);
        setIsExiting(false);

        visibilityTimerRef.current = setTimeout(() => {
            setIsVisible(true);
        }, 10);

        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        if (exitTimerRef.current) {
            clearTimeout(exitTimerRef.current);
        }

        timerRef.current = setTimeout(() => {
            setIsExiting(true);

            exitTimerRef.current = setTimeout(() => {
                showToast(false);
                setIsVisible(false);
            }, 300);
        }, 3000);

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }

            if (visibilityTimerRef.current) {
                clearTimeout(visibilityTimerRef.current);
                visibilityTimerRef.current = null;
            }

            if (exitTimerRef.current) {
                clearTimeout(exitTimerRef.current);
                exitTimerRef.current = null;
            }
        };
    }, [toast, showToast]);

    return (
        <div
            className={`app-transition toast 
                ${isVisible ? (isExiting ? "toast_exit" : "toast_active") : ""} 
                ${toast?.type === "info" ? "toast_type_info" : ""}
                ${toast?.type === "warning" ? "toast_type_warning" : ""}
                ${toast?.type === "success" ? "toast_type_success" : ""}
                ${toast?.type === "error" ? "toast_type_error" : ""}
            `}
        >
            <p>{toast?.message}</p>
        </div>
    );
};

export default Toast;