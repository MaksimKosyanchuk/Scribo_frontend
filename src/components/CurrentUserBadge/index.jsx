import UserBadge from '../UserBadge/index';
import "./CurrentUserBadge.scss";
import { useContext } from 'react';
import { AppContext } from '../../App';
import { Link } from 'react-router-dom';
import DefaultProfileAvatar from "../../assets/images/default-profile-avatar.png"


const CurrentUserBadge = ({ className, as_link = true, only_avatar = false, DefaultAvatar }) => {
    const { profile } = useContext(AppContext)

    return (
        profile ? 
            <UserBadge data={profile} class_name={className} asLink={as_link} onlyAvatar={only_avatar} />
        :
        
        as_link ? 
            <Link to={"/auth/login"} className={`user_badge ${className ?? ''} app-transition`}>
                {
                    DefaultAvatar ?? <img src={DefaultProfileAvatar} alt="Default Avatar" className='user_badge_default_avatar' />
                }
            </Link>
        :
            <div className={`user_badge ${className ?? ''} app-transition`}>
                {
                    DefaultAvatar ?? <img src={DefaultProfileAvatar} alt="Default Avatar" className='user_badge_default_avatar' />
                }
            </div>
    )
};

export default CurrentUserBadge;