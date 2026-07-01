import { useState, useRef } from "react";
import "./Tooltip.scss";

const Tooltip = ({ text, children, className }) => {
    const [position, setPosition] = useState("top");
    const wrapperRef = useRef(null);

    const handleMouseEnter = () => {
        if (!wrapperRef.current) return;

        const rect = wrapperRef.current.getBoundingClientRect();
        
        const tooltipExpectedHeight = 50; 

        if (rect.top < tooltipExpectedHeight) {
            setPosition("bottom");
        } else {
            setPosition("top");
        }
    };

    return (
        <div 
            className={`tooltip_wrapper ${className || ""}`} 
            ref={wrapperRef}
            onMouseEnter={handleMouseEnter}
        >
            {children}
            <div className={`tooltip tooltip_${position}`}>
                <p className="tooltip_text">{text}</p>
            </div>
        </div>
    );
};

export default Tooltip;