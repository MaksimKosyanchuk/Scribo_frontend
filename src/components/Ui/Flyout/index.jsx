import { useLayoutEffect, useState } from "react";
import {
    autoUpdate,
    flip,
    FloatingPortal,
    offset,
    shift,
    useDismiss,
    useFloating,
    useHover,
    useInteractions,
    useRole,
    safePolygon,
} from "@floating-ui/react";

import "./Flyout.scss";

const PORTAL_ROOT = "app-layout";

const Flyout = ({
    children,
    content,
    open: openProp,
    onOpenChange,
    placement = "top-start",
    virtualAnchor,
    className,
}) => {
    const isControlled = openProp !== undefined;
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const open = isControlled ? openProp : uncontrolledOpen;
    const setOpen = (next) => {
        if (!isControlled) {
            setUncontrolledOpen(next);
        }
        onOpenChange?.(next);
    };

    const { refs, floatingStyles, context } = useFloating({
        open,
        onOpenChange: setOpen,
        placement,
        strategy: "fixed",
        middleware: [offset(8), flip(), shift({ padding: 8 })],
        whileElementsMounted: autoUpdate,
    });

    useLayoutEffect(() => {
        if (!virtualAnchor) {
            return;
        }
        refs.setReference({
            getBoundingClientRect: () => virtualAnchor.getBoundingClientRect(),
            contextElement: virtualAnchor.contextElement,
        });
    }, [refs, virtualAnchor]);

    const hover = useHover(context, {
        enabled: !isControlled && !virtualAnchor,
        handleClose: safePolygon({ buffer: 6 }),
        delay: { open: 80, close: 120 },
    });
    const dismiss = useDismiss(context, {
        enabled: Boolean(virtualAnchor) || isControlled,
        outsidePress: !virtualAnchor,
    });
    const role = useRole(context, { role: "tooltip" });
    const { getReferenceProps, getFloatingProps } = useInteractions([hover, dismiss, role]);

    if (!content) {
        return children || null;
    }

    const portalRoot = typeof document === "undefined"
        ? null
        : document.getElementById(PORTAL_ROOT);

    return (
        <>
            {children ? (
                <span
                    className={`flyout_trigger ${className || ""}`}
                    ref={virtualAnchor ? undefined : refs.setReference}
                    {...(virtualAnchor ? {} : getReferenceProps())}
                >
                    {children}
                </span>
            ) : null}
            {open ? (
                <FloatingPortal root={virtualAnchor ? undefined : portalRoot}>
                    <div
                        ref={refs.setFloating}
                        style={floatingStyles}
                        className="flyout float_section blurred"
                        {...getFloatingProps()}
                    >
                        {content}
                    </div>
                </FloatingPortal>
            ) : null}
        </>
    );
};

export default Flyout;
