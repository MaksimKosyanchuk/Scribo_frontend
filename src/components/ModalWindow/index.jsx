import { useEffect, useState, useRef } from "react";
import { useLocation } from 'react-router'
import { ReactComponent as CrossIcon } from "../../assets/svg/cross-icon.svg";
import "./ModalWindow.scss"

const ModalWindow = ({ modalWindow, showModalWindow, modalCloseRequest }) => {
    const [ isVisible, setIsVisible ] = useState(false)
    let location = useLocation()

    useEffect(() => {
        close_modal_window()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[location])

    const closeTimeoutRef = useRef(null)

    const close_modal_window = () => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current)
            closeTimeoutRef.current = null
        }
        setIsVisible(false)

        const closeFunc = modalWindow?.close_func
        closeTimeoutRef.current = setTimeout(() => {
            document.body.classList.remove("no-scroll");
            if (closeFunc) {
                try { closeFunc() } catch (e) { console.error(e) }
            }
            showModalWindow(false)
            closeTimeoutRef.current = null
        }, 300)
    }

    const open_modal_window = () => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current)
            closeTimeoutRef.current = null
        }
        document.body.classList.add("no-scroll");
        setIsVisible(true)
    }

    useEffect(() => {
        if(modalWindow) {
            open_modal_window()
        }
        else {
            close_modal_window()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modalWindow])

    const prevCloseReqRef = useRef(modalCloseRequest)
    useEffect(() => {
        if (modalCloseRequest !== prevCloseReqRef.current) {
            prevCloseReqRef.current = modalCloseRequest
            if (modalWindow) {
                close_modal_window()
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [modalCloseRequest])

    useEffect(() => {
        return () => {
            if (closeTimeoutRef.current) {
                clearTimeout(closeTimeoutRef.current)
                closeTimeoutRef.current = null
            }
        }
    }, [])
    
    return (
       <div className={`modal_window ${isVisible ? 'visible' : ''}`} >
            <button onClick={ () => { close_modal_window() }} className="modal_window_background"/>
            <div className={`modal_window_body blurred ${modalWindow?.size === 'small' ? 'modal_window_body_small' : (modalWindow?.size === 'large' ? 'modal_window_body_large' : '')}`}>
                <div className="modal_window_body_title">
                    <p className="modal_window_body_title_text">{modalWindow?.title ?? ""}</p>
                    {
                        modalWindow?.show_close_button === false
                        ?
                            <></>
                        :
                        <button onClick={close_modal_window} className="modal_window_body_title_close_button app-transition">
                            <CrossIcon/>
                        </button>
                    }
                </div>
                <div className="modal_window_body_content">
                    {modalWindow?.content ?? <></>}
                </div>
            </div>
       </div>
    )
}

export default ModalWindow;