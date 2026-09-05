import UserBadge from '../UserBadge/index';
import "./CurrentUserBadge.scss";
import { useContext } from 'react';
import { AppContext } from '../../App';
import { Link } from 'react-router-dom';
import DefaultProfileAvatar from "../../assets/images/default-profile-avatar.png"


const CurrentUserBadge = ({ className, asLink = true, defaultAvatar }) => {
    const { profile } = useContext(AppContext)

    return (
        profile ? 
            <UserBadge data={profile} className={className} asLink={asLink} />
        :
        
        asLink ? 
            <Link to={"/auth/login"} className={`user_badge ${className ?? ''} app-transition`}>
                {
                    defaultAvatar ?? <img src={DefaultProfileAvatar} alt="Default Avatar" className='user_badge_default_avatar' />
                }
            </Link>
        :
            <div className={`user_badge ${className ?? ''} app-transition`}>
                {
                    defaultAvatar ?? <img src={DefaultProfileAvatar} alt="Default Avatar" className='user_badge_default_avatar' />
                }
            </div>
    )
};

export default CurrentUserBadge;
