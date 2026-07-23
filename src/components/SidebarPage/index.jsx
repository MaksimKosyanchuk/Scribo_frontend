import "./SidebarPage.scss";

import { useSearchParams } from "react-router-dom";

import { ReactComponent as MenuIcon } from "../../assets/svg/menu.svg";
import Popup from "../Ui/Popup";

const SidebarPage = ({ pages, page_title }) => {
    const [searchParams, setSearchParams] = useSearchParams();

    const activeKey = searchParams.get("tab") ?? pages[0].key;

    let activePage = pages.findIndex(page => page.key === activeKey);

    if (activePage === -1) {
        activePage = 0;
    }

    const setPage = (key) => {
        setSearchParams({ tab: key });
    };

    return (
        <div className="sidebar_page">
            <div className="sidebar_page_navigation section app-transition">
                <h1>{page_title}</h1>

                <div className="sidebar_page_navigation_list">
                    {pages.map((page, index) => (
                        <button
                            key={page.key}
                            className={`sidebar_page_navigation_list_item app-transition ${
                                activePage === index
                                    ? "sidebar_page_navigation_list_item_active"
                                    : ""
                            }`}
                            onClick={() => setPage(page.key)}
                        >
                            {page.icon}
                            <p>{page.title}</p>
                        </button>
                    ))}
                </div>
            </div>

            <div className="sidebar_page_content section app-transition">
                <div className="sidebar_page_content_item app-transition">
                    <div className="sidebar_page_content_item_menu app-transition">
                        <Popup
                            body={pages.map(page => ({
                                title: page.title,
                                icon: page.icon,
                                onClick: () => setPage(page.key),
                            }))}
                        >
                            <MenuIcon />
                        </Popup>
                    </div>

                    <h1>{pages[activePage].title}</h1>

                    {pages[activePage].content}
                </div>
            </div>
        </div>
    );
};

export default SidebarPage;