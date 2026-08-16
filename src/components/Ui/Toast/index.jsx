import { useEffect, useRef, useState } from "react";
import "./Toast.scss";

const TOAST_DURATION = 3000;
const ENTER_DELAY = 20;
const EXIT_DURATION = 700;

const Toast = ({ toast }) => {
    const [toasts, setToasts] = useState([]);

    const timersRef = useRef(new Map());

    useEffect(() => {
        if (!toast) {
            return;
        }

        const id = `${Date.now()}-${Math.random()}`;

        const newToast = {
            id,
            message: toast.message,
            type: toast.type || "info",
            isEntering: true,
            isExiting: false
        };

        setToasts((prev) => [
            ...prev,
            newToast
        ]);

        const enterTimer = setTimeout(() => {
            setToasts((prev) =>
                prev.map((item) =>
                    item.id === id
                        ? {
                            ...item,
                            isEntering: false
                        }
                        : item
                )
            );

            timersRef.current.delete(`${id}-enter`);
        }, ENTER_DELAY);

        timersRef.current.set(`${id}-enter`, enterTimer);

        const timer = setTimeout(() => {
            setToasts((prev) =>
                prev.map((item) =>
                    item.id === id
                        ? {
                            ...item,
                            isExiting: true
                        }
                        : item
                )
            );

            const exitTimer = setTimeout(() => {
                setToasts((prev) =>
                    prev.filter((item) => item.id !== id)
                );

                timersRef.current.delete(`${id}-exit`);
            }, EXIT_DURATION);

            timersRef.current.set(`${id}-exit`, exitTimer);

            timersRef.current.delete(id);
        }, TOAST_DURATION);

        timersRef.current.set(id, timer);
    }, [toast]);

    useEffect(() => {
        const timers = timersRef.current;

        return () => {
            timers.forEach((timer) => {
                clearTimeout(timer);
            });

            timers.clear();
        };
    }, []);

    const visibleToasts = toasts.slice(-3);

    return (
        <div className="toast-container">
            {visibleToasts
                .slice()
                .reverse()
                .map((toast, index) => (
                    <div
                        key={toast.id}
                        className={`
                            float_section
                            blurred
                            toast
                            toast_position_${index}
                            ${toast.isEntering ? "toast_enter" : ""}
                            ${toast.isExiting ? "toast_exit" : ""}
                        `}
                    >
                        <div className="toast_content">
                            <p
                                className={`
                                    toast_indicator
                                    toast_indicator_${toast.type}
                                `}
                            />

                            <p>{toast.message}</p>
                        </div>
                    </div>
                ))}
        </div>
    );
};

export default Toast;