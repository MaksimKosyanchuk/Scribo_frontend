import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation } from "react-router";

import CrossIcon from "../../assets/svg/cross-icon.svg?react";

import "./ModalWindow.scss";

const ModalWindow = ({ modalWindow, showModalWindow, modalCloseRequest }) => {
    const [isVisible, setIsVisible] = useState(false);
    const location = useLocation();

    const closeTimeoutRef = useRef(null);

    const close_modal_window = useCallback(() => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }

        setIsVisible(false);

        const closeFunc = modalWindow?.close_func;

        closeTimeoutRef.current = setTimeout(() => {
            document.body.classList.remove("no-scroll");

            if (closeFunc) {
                try {
                    closeFunc();
                } catch (e) {
                    console.error(e);
                }
            }

            showModalWindow(false);
            closeTimeoutRef.current = null;
        }, 300);
    }, [modalWindow, showModalWindow]);

    const open_modal_window = useCallback(() => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }

        document.body.classList.add("no-scroll");
        setIsVisible(true);
    }, []);

    useEffect(() => {
        close_modal_window();
    }, [location, close_modal_window]);

    useEffect(() => {
        if (modalWindow) {
            open_modal_window();
        } else {
            close_modal_window();
        }
    }, [modalWindow, open_modal_window, close_modal_window]);

    const prevCloseReqRef = useRef(modalCloseRequest);

    useEffect(() => {
        if (modalCloseRequest !== prevCloseReqRef.current) {
            prevCloseReqRef.current = modalCloseRequest;

            if (modalWindow) {
                close_modal_window();
            }
        }
    }, [modalCloseRequest, modalWindow, close_modal_window]);

    useEffect(() => {
        return () => {
            if (closeTimeoutRef.current) {
                clearTimeout(closeTimeoutRef.current);
                closeTimeoutRef.current = null;
            }
        };
    }, []);

    return (
        <div className={`modal_window ${isVisible ? "visible" : ""}`}>
            <button
                onClick={close_modal_window}
                className="modal_window_background"
            />

            <div
                className={`modal_window_body blurred ${
                    modalWindow?.size === "small"
                        ? "modal_window_body_small"
                        : modalWindow?.size === "large"
                            ? "modal_window_body_large"
                            : ""
                }`}
            >
                <div className="modal_window_body_title">
                    <p className="modal_window_body_title_text">
                        {modalWindow?.title ?? ""}
                    </p>

                    {modalWindow?.show_close_button === false ? (
                        <></>
                    ) : (
                        <button
                            onClick={close_modal_window}
                            className="modal_window_body_title_close_button app-transition"
                        >
                            <CrossIcon />
                        </button>
                    )}
                </div>

                <div className="modal_window_body_content">
                    {modalWindow?.content ?? <></>}
                </div>
            </div>
        </div>
    );
};

export default ModalWindow;