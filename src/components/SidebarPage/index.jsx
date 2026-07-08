import "./SidebarPage.scss";

import { useState } from "react";

import { ReactComponent as MenuIcon } from "../../assets/svg/menu.svg";
import Popup from "../Ui/Popup";

const SidebarPage = ({ pages, page_title }) => {
    const [activePage, setActivePage] = useState(0);

    return (
        <div className="sidebar_page">
            <div className="sidebar_page_navigation section app-transition">
                <h1>{page_title}</h1>
                <div className="sidebar_page_navigation_list">
                    {
                        pages.map((page, index) => {
                            return (
                                <button key={index} className={`sidebar_page_navigation_list_item app-transition ${activePage === index ? 'sidebar_page_navigation_list_item_active' : ''}`} onClick={() => setActivePage(index)}>
                                    {page?.icon}
                                    <p>{page?.title}</p>
                                </button>
                            );
                        })
                    }
                </div>
            </div>
            <div className="sidebar_page_content section app-transition">
                {
                    pages.map( (page, index) => {
                        return(
                            index === activePage ? 
                                <div key={index} className="sidebar_page_content_item app-transition">
                                    <div className="sidebar_page_content_item_menu app-transition">
                                        <Popup 
                                            body={pages.map( (page, index) => {
                                                return {
                                                    title: page?.title,
                                                    onclick: () => { setActivePage(index) },
                                                    icon: page?.icon
                                                }
                                            } )}
                                        >
                                            <MenuIcon />
                                        </Popup>
                                    </div>
                                    <h1>{page?.title}</h1>
                                    {page?.content}
                                </div>
                            :
                                null
                        )
                    } )
                }
            </div>
        </div>
    )
}

export default SidebarPage