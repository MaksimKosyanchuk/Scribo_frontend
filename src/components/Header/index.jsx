import { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import { AppContext } from '../../App';

import './Header.scss';

import { getUsers, read_notifications } from '../../api/users.api';
import { format_back } from "../../utils/format";

import { ReactComponent as SunIcon } from "../../assets/svg/sun.svg";
import { ReactComponent as MoonIcon } from "../../assets/svg/moon.svg";
import { ReactComponent as MainLogo } from "../../assets/svg/full-logo-icon.svg";
import { ReactComponent as DefaultProfileIcon } from "../../assets/svg/profile.svg";
import { ReactComponent as NotificationIcon } from "../../assets/svg/notification.svg";
import { ReactComponent as PlusIcon } from "../../assets/svg/plus-icon.svg";
import { ReactComponent as SettingsIcon } from "../../assets/svg/settings.svg";
import { ReactComponent as LogoutIcon } from "../../assets/svg/logout.svg";
import { ReactComponent as ArrowDownIcon } from '../../assets/svg/chevron-down.svg';
import { ReactComponent as RedirectIcon } from '../../assets/svg/redirect.svg';

import UserBadge from '../UserBadge/index';
import CurrentUserBadge from "../CurrentUserBadge/index"
import PrimaryButton from '../Ui/PrimaryButton/index';
import ActionButton from '../Ui/ActionButton/index';
import Popup from '../Ui/Popup/index';

function Header() {
  const { showToast, profile, setProfile, setIsDarkTheme, isDarkTheme, showModalWindow } = useContext(AppContext)

  const navigate = useNavigate();
  const location = useLocation();

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

      return [...notifications].reverse().map((item, index) => (
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
    
  const open_notifications = async () => {
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
              profile?.is_admin ? 
              <>
                  {
                    location.pathname === '/admin-panel' ?
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
              ["author", "admin", "tech_admin"].includes(profile?.role) ?
                <PrimaryButton className="header_admin_button header_admin_button_create" onClick={() => { navigate('/create-post') }}>
                  <PlusIcon/>
                    Создать пост
                </PrimaryButton>
              :
                <></>
            }
            <button type='button' onClick={() => { open_notifications() }} className='header_item header_notification'>
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
            <button type='button' onClick={() => setIsDarkTheme(!isDarkTheme)} className='header_item'>
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

              <Popup className="header_user_badge_popup" z_index={3000}
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
                  ...(profile?.is_admin
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
                      localStorage.removeItem("token");
                      setProfile(null);
                      showToast({type: "success", message: "Вы вышли из аккаунта!"})
                    }
                  }
                ]}
              >
                <CurrentUserBadge as_link={false} DefaultAvatar={<DefaultProfileIcon className='header_item_icon app-transition'/>}/> 
                <ArrowDownIcon className="header_item_icon header_user_badge_popup_arrow app-transition"/>
              </Popup>
              :
                <CurrentUserBadge as_link={true} className={"header_item"} DefaultAvatar={<DefaultProfileIcon className='header_item_icon app-transition'/>}/> 
            }
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
