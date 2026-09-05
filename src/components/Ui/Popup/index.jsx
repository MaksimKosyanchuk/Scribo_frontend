import { useEffect, useRef, useState } from "react";
import {
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
  FloatingPortal,
} from "@floating-ui/react";
import "./Popup.scss";

function PopupMenu({ anchorRef, children, onClose, zIndex }) {
    const popupRef = useRef(null);

    const { refs, floatingStyles } = useFloating({
        elements: {
            reference: anchorRef.current,
        },
        placement: "bottom-start",
        strategy: "fixed",
        middleware: [offset(8), flip(), shift({ padding: 8 })],
        whileElementsMounted: autoUpdate,
    });

    useEffect(() => {
        function handleClick(e) {
            if (
                popupRef.current?.contains(e.target) ||
                anchorRef.current?.contains(e.target)
            ) {
                return;
            }
            onClose();
        }

        document.addEventListener("mousedown", handleClick);    
        return () => document.removeEventListener("mousedown", handleClick);
    }, [onClose, anchorRef]);

    return (
        <FloatingPortal root={document.getElementById("app-layout")}>
            <div
                ref={(node) => {
                    refs.setFloating(node);
                    popupRef.current = node;
                }}
                style={{
                    ...floatingStyles,
                    zIndex,
                }}
                className="popup_menu float_section blurred"
            >
                {children}
            </div>
        </FloatingPortal>
    );
}

function Popup({ children, body, zIndex = 99, className }) {
    const buttonRef = useRef(null);
    const [open, setOpen] = useState(false);
    
    return (
        <div className="popup">
            {
                <div className={`popup_trigger ${className || ""}`} ref={buttonRef} onClick={() => setOpen(o => !o)}>
                    {children}
                </div>
            }

            {open && (
                !body || body.length === 0 ? <></> :
                <PopupMenu
                    anchorRef={buttonRef}
                    onClose={() => setOpen(false)}
                    zIndex={zIndex}
                >
                    {
                        body.map((item, index) => (
                            <button 
                                key={index} 
                                className={`popup_menu_item app-transition ${item.className ?? ""} ${item?.type === "danger" ? "popup_menu_item_danger" : ""}`}
                                onClick={() => {
                                    item.onClick();
                                    setOpen(false);
                                }}
                            >
                                {item.icon}
                                <p className="popup_menu_item_title">
                                    {item.title}
                                </p>
                            </button>
                        ))
                    }
                </PopupMenu>
            )}
        </div>
    );
}


export default Popup;