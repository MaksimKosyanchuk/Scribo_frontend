import { useState } from "react";
import "./Pagination.scss";

import { ReactComponent as ChevronLeft } from "../../../assets/svg/chevron-left.svg";
import { ReactComponent as ChevronRight } from "../../../assets/svg/chevron-right.svg";

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

const Pagination = ({ content, limit = 5, children }) => {
    const [currentPage, setCurrentPage] = useState(0);

    const pagesCount = Math.ceil(content.length / limit);

    const visibleContent = content.slice(
        currentPage * limit,
        currentPage * limit + limit
    );

    return (
        <>
            {children(visibleContent)}
            {
                pagesCount === 1 ?
                    <></>
                :
                    <div className="pagination_panel">
                        {
                            currentPage === 0 ?
                                <></>
                            :
                                <button className={`app-transition pagination_navigation_button`} onClick={() => setCurrentPage(p => p - 1)}>
                                    <ChevronLeft className="app-transition" />
                                    <p>
                                        Назад
                                    </p>
                                </button>
                        }

                        {
                            getPaginationRange(currentPage, pagesCount).map(index => {
                                return (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentPage(index)}
                                        className={`app-transition ${currentPage === index ? "pagination_active" : ""}`}
                                    >
                                        <p>
                                            {index + 1}
                                        </p>
                                    </button>
                                )
                            })

                        }
                        {
                            currentPage === pagesCount - 1 ?
                                <></>
                            :
                            <button className={`app-transition pagination_navigation_button`} onClick={() => setCurrentPage(p => p + 1)}>
                                <p>
                                    Вперед
                                </p>
                                <ChevronRight className="app-transition" />
                            </button>
                        }
                    </div>
            }
        </>
    );
};


export default Pagination;