import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation } from "react-router";

import CrossIcon from "../../assets/svg/cross-icon.svg?react";

import "./ModalWindow.scss";

const ModalWindow = ({ modalWindow, showModalWindow, modalCloseRequest }) => {
    const [isVisible, setIsVisible] = useState(false);
    const location = useLocation();

    const closeTimeoutRef = useRef(null);

    const closeModalWindow = useCallback(() => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }

        setIsVisible(false);

        const closeFunc = modalWindow?.closeFunc;

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

    const openModalWindow = useCallback(() => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }

        document.body.classList.add("no-scroll");
        setIsVisible(true);
    }, []);

    useEffect(() => {
        closeModalWindow();
    }, [location, closeModalWindow]);

    useEffect(() => {
        if (modalWindow) {
            openModalWindow();
        } else {
            closeModalWindow();
        }
    }, [modalWindow, openModalWindow, closeModalWindow]);

    const prevCloseReqRef = useRef(modalCloseRequest);

    useEffect(() => {
        if (modalCloseRequest !== prevCloseReqRef.current) {
            prevCloseReqRef.current = modalCloseRequest;

            if (modalWindow) {
                closeModalWindow();
            }
        }
    }, [modalCloseRequest, modalWindow, closeModalWindow]);

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
                onClick={closeModalWindow}
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

                    {modalWindow?.showCloseButton === false ? (
                        <></>
                    ) : (
                        <button
                            onClick={closeModalWindow}
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