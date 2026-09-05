import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
    useFloating,
    offset,
    flip,
    shift,
    autoUpdate,
    FloatingPortal,
    FloatingTree,
    FloatingNode,
    useFloatingNodeId,
    useHover,
    useInteractions,
    safePolygon,
} from "@floating-ui/react";
import "./Popup.scss";

import ChevronRightIcon from "../../../assets/svg/chevron-right.svg?react";

const MENU_ROOT_DEFAULT = "app-layout";

function normalizeSections(body) {
    if (!Array.isArray(body) || body.length === 0) {
        return [];
    }

    const sections = Array.isArray(body[0]) ? body : [body];

    return sections
        .map((section) => (Array.isArray(section) ? section.filter(Boolean) : []))
        .filter((section) => section.length > 0);
}

function canHoverFinePointer() {
    return typeof window !== "undefined"
        && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function findActiveItem(sections) {
    for (const section of sections) {
        for (const item of section) {
            if (item.isActive) {
                return item;
            }
        }
    }

    return null;
}

function useFloatingPosition(refs, x, y) {
    useLayoutEffect(() => {
        const node = refs.floating.current;

        if (!node) {
            return;
        }

        node.style.setProperty("--popup-x", `${Math.round(x ?? 0)}px`);
        node.style.setProperty("--popup-y", `${Math.round(y ?? 0)}px`);
    }, [refs, x, y]);
}

function MenuItem({ item, onItemSelect, portalRootId }) {
    if (item.type === "submenu" || item.type === "dropdown") {
        return (
            <FlyoutItem
                item={item}
                onItemSelect={onItemSelect}
                portalRootId={portalRootId}
            />
        );
    }

    return (
        <button
            type="button"
            className={`popup_menu_item app-transition ${item.className ?? ""} ${item.type === "danger" ? "popup_menu_item_danger" : ""} ${item.isActive ? "popup_menu_item_active" : ""}`}
            onClick={() => {
                if (!item.isActive) {
                    item.onClick?.();
                }
                onItemSelect();
            }}
        >
            {item.icon}
            <p className="popup_menu_item_title">
                {item.title}
            </p>
        </button>
    );
}

function MenuBody({ sections, onItemSelect, portalRootId }) {
    return sections.map((section, sectionIndex) => (
        <Fragment key={sectionIndex}>
            {sectionIndex > 0 && <div className="popup_menu_separator" role="separator" />}
            <div className="popup_menu_section">
                {section.map((item, itemIndex) => (
                    <MenuItem
                        key={item.id ?? `${sectionIndex}-${itemIndex}`}
                        item={item}
                        onItemSelect={onItemSelect}
                        portalRootId={portalRootId}
                    />
                ))}
            </div>
        </Fragment>
    ));
}

function FlyoutItem({ item, onItemSelect, portalRootId = MENU_ROOT_DEFAULT }) {
    const nodeId = useFloatingNodeId();
    const [open, setOpen] = useState(false);
    const sections = normalizeSections(item.items);
    const isDropdown = item.type === "dropdown";
    const valueLabel = item.valueLabel ?? findActiveItem(sections)?.title;

    const { refs, x, y, context } = useFloating({
        nodeId,
        open,
        onOpenChange: setOpen,
        placement: "right-start",
        strategy: "fixed",
        middleware: [
            offset(6),
            flip({ fallbackPlacements: ["left-start", "right-end", "left-end"] }),
            shift({ padding: 8 }),
        ],
        whileElementsMounted: autoUpdate,
    });

    useFloatingPosition(refs, x, y);

    const hover = useHover(context, {
        handleClose: safePolygon({ buffer: 6 }),
        delay: { open: 40, close: 100 },
    });

    const { getReferenceProps, getFloatingProps } = useInteractions([hover]);

    if (sections.length === 0) {
        return null;
    }

    return (
        <FloatingNode id={nodeId}>
            <button
                type="button"
                ref={refs.setReference}
                className={`popup_menu_item popup_menu_item_flyout app-transition ${isDropdown ? "popup_menu_item_dropdown" : ""} ${item.className ?? ""}`}
                {...getReferenceProps({
                    onClick: (event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        if (!canHoverFinePointer()) {
                            setOpen((current) => !current);
                        }
                    },
                })}
            >
                {item.icon}
                <p className="popup_menu_item_title">
                    {item.title}
                </p>
                {isDropdown && valueLabel ? (
                    <p className="popup_menu_item_value">{valueLabel}</p>
                ) : null}
                <ChevronRightIcon className="popup_menu_item_chevron" />
            </button>

            {open && (
                <FloatingPortal root={document.getElementById(portalRootId)}>
                    <div
                        {...getFloatingProps({
                            ref: (node) => {
                                refs.setFloating(node);
                                if (node) {
                                    node.style.setProperty("--popup-x", `${Math.round(x ?? 0)}px`);
                                    node.style.setProperty("--popup-y", `${Math.round(y ?? 0)}px`);
                                }
                            },
                            className: "popup_menu popup_menu_nested float_section blurred",
                        })}
                    >
                        <MenuBody
                            sections={sections}
                            onItemSelect={onItemSelect}
                            portalRootId={portalRootId}
                        />
                    </div>
                </FloatingPortal>
            )}
        </FloatingNode>
    );
}

function PopupMenu({ anchorRef, children, onClose, portalRootId }) {
    const { refs, x, y } = useFloating({
        elements: {
            reference: anchorRef.current,
        },
        placement: "bottom-start",
        strategy: "fixed",
        middleware: [offset(8), flip(), shift({ padding: 8 })],
        whileElementsMounted: autoUpdate,
    });

    useFloatingPosition(refs, x, y);

    useEffect(() => {
        function handleClick(event) {
            if (
                event.target.closest(".popup_menu") ||
                anchorRef.current?.contains(event.target)
            ) {
                return;
            }
            onClose();
        }

        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [onClose, anchorRef]);

    return (
        <FloatingPortal root={document.getElementById(portalRootId)}>
            <div
                ref={(node) => {
                    refs.setFloating(node);
                    if (node) {
                        node.style.setProperty("--popup-x", `${Math.round(x ?? 0)}px`);
                        node.style.setProperty("--popup-y", `${Math.round(y ?? 0)}px`);
                    }
                }}
                className="popup_menu float_section blurred"
            >
                {children}
            </div>
        </FloatingPortal>
    );
}

function Popup({ children, body, className, portalRootId = MENU_ROOT_DEFAULT }) {
    const buttonRef = useRef(null);
    const [open, setOpen] = useState(false);
    const sections = normalizeSections(body);

    return (
        <div className="popup">
            <div
                className={`popup_trigger ${className || ""}`}
                ref={buttonRef}
                onClick={() => setOpen((current) => !current)}
            >
                {children}
            </div>

            {open && sections.length > 0 && (
                <FloatingTree>
                    <PopupMenu
                        anchorRef={buttonRef}
                        onClose={() => setOpen(false)}
                        portalRootId={portalRootId}
                    >
                        <MenuBody
                            sections={sections}
                            onItemSelect={() => setOpen(false)}
                            portalRootId={portalRootId}
                        />
                    </PopupMenu>
                </FloatingTree>
            )}
        </div>
    );
}

export default Popup;
