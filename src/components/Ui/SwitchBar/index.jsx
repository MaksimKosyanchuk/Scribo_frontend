import "./SwitchBar.scss";
import { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";

export default function SwitchBar({
    activeIndex,
    setActiveIndex,
    items,
}) {
    const containerRef = useRef(null);
    const buttonsRef = useRef([]);

    const [indicator, setIndicator] = useState({
        left: 0,
        width: 0,
    });

    const updateIndicator = useCallback(() => {
        const button = buttonsRef.current[activeIndex];

        if (!button) return;

        setIndicator({
            left: button.offsetLeft,
            width: button.offsetWidth,
        });

    }, [activeIndex]);

    useLayoutEffect(() => {
        updateIndicator();
    }, [activeIndex, items, updateIndicator]);

    useEffect(() => {
        window.addEventListener("resize", updateIndicator);

        return () =>
            window.removeEventListener("resize", updateIndicator);
    }, [updateIndicator]);

    return (
        <div
            ref={containerRef}
            className="switcher_bar app-transition"
        >
            <div
                className="switcher_bar_indicator"
                style={{
                    width: indicator.width,
                    transform: `translateX(${indicator.left}px)`,
                }}
            />

            {items?.map((item, index) => (
                <button
                    key={index}
                    ref={(el) => (buttonsRef.current[index] = el)}
                    type="button"
                    className={`switcher_bar_item ${
                        activeIndex === index
                            ? "switcher_bar_item_active"
                            : ""
                    }`}
                    onClick={() => setActiveIndex(index)}
                >
                    {item}
                </button>
            ))}
        </div>
    );
}