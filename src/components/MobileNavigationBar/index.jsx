import "./MobileNavigationBar.scss";

import { useEffect, useState, useContext, useMemo, useCallback } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

import { AppContext } from "../../App";

import HomeIcon from "../../assets/svg/home-icon.svg?react";
import ProfileIcon from "../../assets/svg/profile-icon.svg?react";
import NotificationsIcon from "../../assets/svg/notification.svg?react";
import PlusIcon from "../../assets/svg/plus-icon.svg?react";
import RedirectIcon from "../../assets/svg/redirect.svg?react";

import {  getUsers, read_notifications } from "../../api/users.api";
import { format_back } from "../../utils/format";

import SwitchBar from "../Ui/SwitchBar/index";
import UserBadge from "../UserBadge/index";


const renderItems = (items) => {
    return items.map((item, index) => {
        return (
            <div key={index} className="navigation_item">
                {
                    item.icon ? 
                        <item.icon />
                    :
                    <>
                        <span>{item.path}</span>
                        <span>{item.index}</span>
                    </>
                }
            </div>
        )
    })
}

const MobileNavigationBar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { profile, setProfile, showToast, showModalWindow } = useContext(AppContext);
    const [activeIndex, setActiveIndex] = useState(0);
    
    const get_notification = async (notifications) => {
        const userIds = [
            ...new Set(
                notifications
                    .map(item => item.user)
                    .filter(Boolean)
            )
        ];

        const users = await getUsers(
            userIds.map(_id => ({ _id }))
        );

        const userMap = users?.data?.reduce((acc, u) => {
            acc[u._id] = u;
            return acc;
        }, {});

        return [...notifications].reverse().map((item) => (
            <div key={item._id} className="modal_window_body_content_notification">
                <div className='modal_window_body_content_notification_new'>
                    {
                        !item.is_read ?
                            <div className="modal_window_body_content_notification_new_circle"></div>
                        :
                            <></>
                    }
                    <UserBadge data={userMap[item?.user]} />
                </div>
                <p className='modal_window_body_content_notification_message'>
                    {(() => {
                        switch (item.type) {
                        case "follow":
                            return "Подписался(-ась) на ваши обновления"
                            case "unfollow":
                            return "Отписался(-ась) от вас"
                            case "like_post":
                            return (
                                <>Поставил лайк на ваш <Link className="modal_window_body_content_notification_message_post_link" to={`/posts/${item.post}`}>пост</Link></>
                            )
                            case "comment_post":
                            return (
                                <>
                                Прокомментировал(-а) ваш <Link className="modal_window_body_content_notification_message_post_link" to={`/posts/${item.post}`}>пост</Link>
                                </>
                            )
                            case "reply_comment":
                            return (
                                <>
                                Ответил(-а) на <Link className="modal_window_body_content_notification_message_post_link" to={`/posts/${item.post}`} state={{ comment: item.comment, time: Date.now() }}>ваш комментарий</Link>
                                </>
                            )
                            default:
                            return ""
                            }
                        })()}
                    </p>
                <p className='modal_window_body_content_notification_time'>{format_back(item.time)}</p>
            </div>
        ));
    };
        
    const open_notifications = useCallback(async () => {
        if(!profile) {
            showToast({type: "warning", message: "Войдите в аккаунт, чтоб получать уведомления!"})
            return
        }

        const notificationContent = await get_notification(profile?.notifications);
    
        const update_notification = async () => {
            const result = await read_notifications()
            if(result.status === true){
                setProfile({ 
                ...profile, 
                notifications: profile.notifications.map((item) => ({ ...item, is_read: true }))
                });
            }
        }

        showModalWindow({
            title: `Уведомления`,
            content: notificationContent,
            close_func: update_notification
        });
    }, [showModalWindow, setProfile, profile, showToast]);

    const items = useMemo(() => {

        const items = [];

        items.push({
            path: "/posts",
            icon: HomeIcon,
            onClick: () => navigate("/posts")
        });


        if(!profile) {

            items.push({
                path: "/auth/login",
                icon: ProfileIcon,
                onClick: () => navigate("/auth/login")
            });

        } else {

            if(["admin", "tech_admin"].includes(profile.role)) {

                items.push({
                    path: "/admin-panel",
                    icon: RedirectIcon,
                    onClick: () => navigate("/admin-panel")
                });
            }


            if(profile.permissions?.includes("create_post")) {

                items.push({
                    path: "/create-post",
                    icon: PlusIcon,
                    onClick: () => navigate("/create-post")
                });

            }


            items.push({
                path: "/notifications",
                icon: NotificationsIcon,
                onClick: open_notifications
            });


            items.push({
                path: `/users/${profile.nick_name}`,
                icon: ProfileIcon,
                onClick: () => navigate(`/users/${profile.nick_name}`)
            });

        }


        return items.map((item,index)=>({
            ...item,
            index
        }));

    }, [profile, navigate, open_notifications]); 

    useEffect(() => {
        const currentItem = items.find(item => item.path === location.pathname);
        if(currentItem) {
            setActiveIndex(currentItem.index);
        }
    }, [location, items]);

    const handleIndex = (index) => {
        items.at(index).onClick();
    }

    return (
        <div className="navigation_bar float_section app-transition blurred">
            <SwitchBar 
                items={renderItems(items)}
                setActiveIndex={handleIndex}
                active_index={activeIndex}
            />
        </div>
    )
}

export default MobileNavigationBar;