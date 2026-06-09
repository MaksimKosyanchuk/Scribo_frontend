import { useEffect, useRef, useState } from "react";
import {
  useFloating,
  offset,
  flip,
  shift,
  autoUpdate,
} from "@floating-ui/react";
import "./Popup.scss";

function PopupMenu({ anchorRef, children, onClose, z_index }) {
    const popupRef = useRef(null);

    const { refs, floatingStyles } = useFloating({
        elements: {
            reference: anchorRef.current,
        },
        placement: "bottom-start",
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
        <div
            ref={(node) => {
            refs.setFloating(node);
            popupRef.current = node;
            }}
            style={{
                ...floatingStyles,
                zIndex: z_index,
            }}
            className="popup blurred"
        >
            {children}
        </div>
    );
}

function Popup({ children, body, z_index = 99 }) {
    const buttonRef = useRef(null);
    const [open, setOpen] = useState(false);
    
        // when popup opens, raise z-index of closest article container to avoid other elements painting above
        useEffect(() => {
            const node = buttonRef.current
            if (!node) return
            const article = node.closest('.article_topic')
            if (!article) return

            if (open) {
                article.classList.add('article_topic_popup_open')
            } else {
                article.classList.remove('article_topic_popup_open')
            }

            return () => article.classList.remove('article_topic_popup_open')
        }, [open])
    
    return (
        <div style={{ position: "relative" }}>
            {
                <div ref={buttonRef} onClick={() => setOpen(o => !o)} style={{ cursor: "pointer" }}>
                    {children}
                </div>
            }

            {open && (
                !body || body.length === 0 ? <></> :
                <PopupMenu
                    anchorRef={buttonRef}
                    onClose={() => setOpen(false)}
                    z_index={z_index}
                >
                    {
                        body.map((item, index) => (
                            <button 
                                key={index} 
                                className={`popup_item app-transition ${item?.type === "danger" ? "popup_item_danger" : ""}`}
                                onClick={() => {
                                    item.onclick();
                                    setOpen(false);
                                }}
                            >
                                {item.title}
                            </button>
                        ))
                    }
                </PopupMenu>
            )}
        </div>
    );
}


export default Popup;