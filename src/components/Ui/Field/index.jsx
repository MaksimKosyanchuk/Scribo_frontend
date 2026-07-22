import { ReactComponent as WarningIcon } from "../../../assets/svg/warning-icon.svg";

import "./Field.scss";

const Field = ({ children, title, error }) => {
    return (
        <div className={`field ${error ? "show" : ""}`}>
            <div className="field_content">
                {title && <p className="field_content_label">{title}</p>}
                {children}
            </div>
            <div className="field_error">
                <div className="field_error_content">
                    <WarningIcon />
                    <p>{error}</p>
                </div>
            </div>
        </div>
    );
};

export default Field;