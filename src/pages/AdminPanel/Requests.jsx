import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AppContext } from "../../App.jsx";
import { getSupportRequests } from "../../api/support.api";
import { SUPPORT_KINDS, SUPPORT_STATUSES, kindLabel, statusLabel } from "../Support/constants";
import { format_back, format_date_time } from "../../utils/format";

import DropDown from "../../components/Ui/DropDown";
import Pagination from "../../components/Ui/Pagination";
import Loading from "../../components/Ui/Loading";
import Tooltip from "../../components/Ui/Tooltip";

import "./Requests.scss";

const STATUS_OPTIONS = [
    { value: "all", name: "Все статусы" },
    ...SUPPORT_STATUSES
];

const KIND_OPTIONS = [
    { value: "all", name: "Все типы" },
    ...SUPPORT_KINDS
];

const SORT_OPTIONS = [
    { value: "created_date:desc", name: "Сначала новые" },
    { value: "created_date:asc", name: "Сначала старые" },
    { value: "updated_date:desc", name: "Недавно обновлённые" }
];

const RequestsPage = () => {
    const navigate = useNavigate();
    const { showToast } = useContext(AppContext);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagesCount, setPagesCount] = useState(0);
    const [status, setStatus] = useState("all");
    const [kind, setKind] = useState("all");
    const [sortValue, setSortValue] = useState("created_date:desc");

    useEffect(() => {
        let cancelled = false;

        const fetchRequests = async () => {
            const [sort, order] = sortValue.split(":");
            const result = await getSupportRequests({
                page,
                limit: 9,
                status: status === "all" ? undefined : status,
                kind: kind === "all" ? undefined : kind,
                sort,
                order
            });

            if (cancelled) {
                return;
            }

            if (!result.status) {
                showToast({
                    type: "error",
                    message: result.message
                });
                setItems([]);
                setPagesCount(0);
                setLoading(false);
                return;
            }

            setItems(result.data?.items || []);
            setPagesCount(result.data?.pagination?.pages || 0);
            setLoading(false);
        };

        fetchRequests();

        return () => {
            cancelled = true;
        };
    }, [page, status, kind, sortValue, showToast]);

    if (loading) {
        return <Loading size={40} />;
    }

    return (
        <div className="admin_panel_content_requests_page">
            <div className="admin_panel_content_requests_page_filters">
                <DropDown
                    options={STATUS_OPTIONS}
                    value={status}
                    placeholder="Статус"
                    onChange={(value) => {
                        setStatus(value);
                        setPage(1);
                    }}
                />
                <DropDown
                    options={KIND_OPTIONS}
                    value={kind}
                    placeholder="Тип"
                    onChange={(value) => {
                        setKind(value);
                        setPage(1);
                    }}
                />
                <DropDown
                    options={SORT_OPTIONS}
                    value={sortValue}
                    placeholder="Сортировка"
                    onChange={(value) => {
                        setSortValue(value);
                        setPage(1);
                    }}
                />
            </div>
            <Pagination
                content={items}
                page={page - 1}
                pagesCount={pagesCount}
                onPageChange={(index) => setPage(index + 1)}
            >
                {(visibleContent) => (
                    visibleContent.length ?
                        visibleContent.map((item) => (
                            <button
                                type="button"
                                key={item._id}
                                className="admin_panel_content_requests_page_item app-transition"
                                onClick={() => navigate(item.access_key ? `/support/${item.access_key}` : `/admin-panel/requests/${item._id}`)}
                            >
                                <div className="admin_panel_content_requests_page_item_meta">
                                    <span className={`support_status support_status_${item.status}`}>
                                        {statusLabel(item.status)}
                                    </span>
                                    <span className="support_kind">{kindLabel(item.kind)}</span>
                                </div>
                                <p className="admin_panel_content_requests_page_item_email">{item.email}</p>
                                <p className="admin_panel_content_requests_page_item_preview">{item.message_preview}</p>
                                <Tooltip text={format_date_time(item.created_date)}>
                                    <p className="admin_panel_content_requests_page_item_time">
                                        {format_back(item.created_date)}
                                    </p>
                                </Tooltip>
                            </button>
                        ))
                    :
                        <p className="admin_panel_content_requests_page_empty">Запросов нет</p>
                )}
            </Pagination>
        </div>
    );
};

export default RequestsPage;
