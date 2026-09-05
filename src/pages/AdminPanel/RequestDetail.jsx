import { useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { AppContext } from "../../App.jsx";
import { getSupportRequest } from "../../api/support.api";
import Loading from "../../components/Ui/Loading";

import "./RequestDetail.scss";

const RequestDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { profile, profileLoading, showToast } = useContext(AppContext);

    useEffect(() => {
        if (!profileLoading && !["admin", "tech_admin"].includes(profile?.role)) {
            navigate("/");
        }
    }, [profile, profileLoading, navigate]);

    useEffect(() => {
        let cancelled = false;

        const redirectToPublic = async () => {
            const result = await getSupportRequest(id);

            if (cancelled) {
                return;
            }

            if (!result.status || !result.data?.access_key) {
                showToast({ type: "error", message: result.message || "Запрос не найден" });
                navigate("/admin-panel?tab=requests", { replace: true });
                return;
            }

            navigate(`/support/${result.data.access_key}`, { replace: true });
        };

        if (["admin", "tech_admin"].includes(profile?.role)) {
            redirectToPublic();
        }

        return () => {
            cancelled = true;
        };
    }, [id, navigate, profile?.role, showToast]);

    return (
        <div className="support_request_detail">
            <Loading size={40} />
        </div>
    );
};

export default RequestDetailPage;
