import { useNavigate } from "react-router-dom";

import PrimaryButton from "../../components/Ui/PrimaryButton";
import "./PageNotFound.scss";

const PageNotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="page_not_found">
            <div className="page_not_found_sheet" aria-hidden="true">
                <div className="page_not_found_rules">
                    <span className="page_not_found_rule app-transition" />
                    <span className="page_not_found_rule app-transition" />
                    <span className="page_not_found_rule app-transition" />
                    <span className="page_not_found_rule app-transition" />
                    <span className="page_not_found_rule app-transition" />
                    <span className="page_not_found_rule app-transition" />
                    <span className="page_not_found_rule app-transition" />
                </div>
                <p className="page_not_found_code">
                    4<span className="page_not_found_zero" />4
                </p>
                <p className="page_not_found_draft">
                    Здесь должен был быть текст
                    <span className="page_not_found_caret" />
                </p>
            </div>
            <div className="page_not_found_copy">
                <h1>Страница потерялась</h1>
                <p className="page_not_found_lead">
                    Этого адреса нет. Либо опечатка, либо черновик так и не стал постом.
                </p>
                <PrimaryButton type="button" onClick={() => navigate("/posts")}>
                    К ленте
                </PrimaryButton>
            </div>
        </div>
    );
};

export default PageNotFound;
