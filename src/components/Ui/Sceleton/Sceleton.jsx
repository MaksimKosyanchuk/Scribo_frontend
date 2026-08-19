import "./Sceleton.scss";

const Sceleton = ({
    isLoading = false,
    children,
    circle = false,
    rounded = false,
    section = true,
    className = ""
}) => {
    if (isLoading) {
        return (
            <div
                className={
                    `sceleton ${className}` +
                    (circle ? " circle" : "") +
                    (rounded ? " rounded" : "") +
                    (section ? " sceleton_section" : "")
                }
            />
        );
    }

    return children;
};

export default Sceleton;