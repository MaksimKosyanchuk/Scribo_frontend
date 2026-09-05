import { useEffect, useState } from "react";
import "./Pagination.scss";

import ChevronLeft from "../../../assets/svg/chevron-left.svg?react";
import ChevronRight from "../../../assets/svg/chevron-right.svg?react";

const getPaginationRange = (currentPage, pagesCount) => {
    const range = 3;

    if (pagesCount <= range) {
        return Array.from({ length: pagesCount }, (_, i) => i);
    }

    if (currentPage === 0) {
        return [0, 1, 2];
    }

    if (currentPage === pagesCount - 1) {
        return [
            pagesCount - 3,
            pagesCount - 2,
            pagesCount - 1
        ];
    }

    return [
        currentPage - 1,
        currentPage,
        currentPage + 1
    ];
};

const Pagination = ({
    content = [],
    limit = 5,
    page,
    pagesCount: pagesCountProp,
    onPageChange,
    children,
    prevLabel = "Назад",
    nextLabel = "Вперед",
}) => {
    const isServer = typeof pagesCountProp === "number" && typeof onPageChange === "function";
    const [currentPage, setCurrentPage] = useState(0);

    const pagesCount = isServer
        ? pagesCountProp
        : Math.ceil(content.length / limit);

    const activePage = isServer ? (page ?? 0) : currentPage;

    useEffect(() => {
        if (isServer) {
            return;
        }

        setCurrentPage(prev => {
            if (pagesCount === 0) {
                return 0;
            }

            return Math.min(prev, pagesCount - 1);
        });
    }, [isServer, pagesCount]);

    const goTo = (next) => {
        if (isServer) {
            onPageChange(next);
            return;
        }

        setCurrentPage(next);
    };

    const visibleContent = isServer
        ? content
        : content.slice(
            activePage * limit,
            activePage * limit + limit
        );

    return (
        <div className="pagination">
            <div className="pagination_content">
                {children(visibleContent)}
            </div>

            {pagesCount > 1 && (
                <div className="pagination_panel">
                    {activePage > 0 && (
                        <button
                            type="button"
                            className="app-transition pagination_navigation_button"
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={() => goTo(activePage - 1)}
                        >
                            <ChevronLeft className="app-transition" />

                            <p>
                                {prevLabel}
                            </p>
                        </button>
                    )}

                    {getPaginationRange(activePage, pagesCount).map(index => (
                        <button
                            type="button"
                            key={index}
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={() => goTo(index)}
                            className={`app-transition ${
                                activePage === index
                                    ? "pagination_active"
                                    : ""
                            }`}
                        >
                            <p>
                                {index + 1}
                            </p>
                        </button>
                    ))}

                    {activePage < pagesCount - 1 && (
                        <button
                            type="button"
                            className="app-transition pagination_navigation_button"
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={() => goTo(activePage + 1)}
                        >
                            <p>
                                {nextLabel}
                            </p>

                            <ChevronRight className="app-transition" />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default Pagination;
