import { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import { AppContext } from '../../App';

import './Header.scss';

import { getUsers, read_notifications } from '../../api/users.api';
import { logout } from '../../api/auth.api';
import { format_back } from "../../utils/format";

import SunIcon from "../../assets/svg/sun.svg?react";
import MoonIcon from "../../assets/svg/moon.svg?react";
import MainLogo from "../../assets/svg/full-logo-icon.svg?react";
import DefaultProfileIcon from "../../assets/svg/profile.svg?react";
import NotificationIcon from "../../assets/svg/notification.svg?react";
import PlusIcon from "../../assets/svg/plus-icon.svg?react";
import SettingsIcon from "../../assets/svg/settings.svg?react";
import LogoutIcon from "../../assets/svg/logout.svg?react";
import ArrowDownIcon from "../../assets/svg/chevron-down.svg?react";
import RedirectIcon from "../../assets/svg/redirect.svg?react";
import CommentIcon from "../../assets/svg/comment.svg?react";

import UserBadge from '../UserBadge/index';
import NotificationMessage from '../NotificationMessage/index';
import CurrentUserBadge from "../CurrentUserBadge/index"
import PrimaryButton from '../Ui/PrimaryButton/index';
import ActionButton from '../Ui/ActionButton/index';
import Popup from '../Ui/Popup/index';

function Header() {
  const { showToast, profile, setProfile, setIsDarkTheme, isDarkTheme, showModalWindow } = useContext(AppContext)

  const navigate = useNavigate();
  const location = useLocation();

  const getNotification = async (notifications) => {
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
          <NotificationMessage item={item} />
        </p>
        <p className='modal_window_body_content_notification_time'>{format_back(item.time)}</p>
      </div>
    ));
  };
    
  const openNotifications = async () => {
    if(!profile) {
      showToast({type: "warning", message: "Войдите в аккаунт, чтоб получать уведомления!"})
      return
    }

    const notificationContent = await getNotification(profile?.notifications);
  
    const updateNotification = async () => {
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
      closeFunc: updateNotification
    });
  };

  return (
    <header className="header blurred app-transition">
      <div className="default-container">
        <div className="header_content">
          <div className="header_side header_left_side">
            <Link to={'/posts'} className='header_main_logo'>
              <MainLogo className='header_icon app-transition'/>
            </Link>
          </div>
          <div className="header_side header_right_side">
            {
              ["admin", "tech_admin"].includes(profile?.role) ?
              <>
                  {
                    location.pathname.startsWith('/admin-panel') ?
                      <ActionButton className="header_admin_button" onClick={() => { navigate('/posts') }}>
                        <RedirectIcon/>
                        Домой
                      </ActionButton>
                    : 
                      <ActionButton className="header_admin_button" onClick={() => { navigate('/admin-panel') }}>
                        <RedirectIcon/>
                        В админ панель
                      </ActionButton>
                  }
              </>
              :
              <></>
            }
            {
              profile && profile.permissions.includes("create_post") ?
                <PrimaryButton className="header_admin_button header_admin_button_create" onClick={() => { navigate('/create-post') }}>
                  <PlusIcon/>
                    Создать пост
                </PrimaryButton>
              :
                <></>
            }
            <button type='button' onClick={() => { openNotifications() }} className='header_item header_notification app-transition'>
              {
                profile?.notifications?.some(item => item.is_read === false ) 
                  ? 
                    <div className='header_notification_new'>
                      <div className='header_notification_new_circle'></div>
                    </div>
                  :
                    <></>
              }
              <NotificationIcon className="header_item_icon app-transition"/>
            </button>
            <button type='button' onClick={() => setIsDarkTheme(!isDarkTheme)} className='header_item app-transition'>
              {
                isDarkTheme ?
                  <MoonIcon className='header_item_icon app-transition'></MoonIcon>
                :
                  <SunIcon className='header_item_icon app-transition'>
                  </SunIcon>
              }
            </button> 
            {
              profile ?

              <Popup className="header_user_badge_popup app-transition" zIndex={3000}
                body={[
                  {
                    "title": "В профиль",
                    icon: <DefaultProfileIcon/>,
                    onClick: () => { navigate(`/users/${profile.nick_name}`) }
                  },
                  {
                    "title": "Настройки",
                    icon: <SettingsIcon/>,
                    onClick: () => { navigate(`/settings`) }
                  },
                  {
                    "title": "Мои запросы",
                    icon: <CommentIcon />,
                    onClick: () => { navigate('/support/mine') }
                  },
                  ...((["admin", "tech_admin"].includes(profile?.role))
                    ? [{
                        title: location.pathname.startsWith("/admin-panel")
                          ? "Домой"
                          : "В админ панель",
                        icon: <RedirectIcon />,
                        onClick: () => navigate(
                          location.pathname.startsWith("/admin-panel")
                            ? "/posts"
                            : "/admin-panel"
                        )
                      }]
                    : []),
                  {
                    "title": "Выйти с акаунта",
                    icon: <LogoutIcon/>,
                    type: "danger",
                    onClick: () => { 
                      setProfile(null);
                      logout().then(() => {
                        showToast({type: "success", message: "Вы вышли из аккаунта!"})
                      })
                    }
                  }
                ]}
              >
                <CurrentUserBadge asLink={false} defaultAvatar={<DefaultProfileIcon className='header_item_icon app-transition'/>}/> 
                <ArrowDownIcon className="header_item_icon header_user_badge_popup_arrow app-transition"/>
              </Popup>
              :
                <CurrentUserBadge asLink={true} className={"header_item"} defaultAvatar={<DefaultProfileIcon className='header_item_icon app-transition'/>}/> 
            }
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
