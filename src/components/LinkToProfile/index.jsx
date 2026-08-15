import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../App';
import { Link } from 'react-router-dom';
import './LinkToProfile.scss'

const LinkToProfile = ({children, class_name}) => {
    const [link, setLink] = useState('/auth/login');

    const { profile } = useContext(AppContext);

    useEffect(() => {
        if (profile) {
            setLink(`/users/${profile.nick_name}`);
        } else {
            setLink('/auth/login');
        }
    }, [profile]);

    return (
        <Link to={link} className={`profile_link ${class_name ?? ""}`}>
            {children}
        </Link>
    );
};

export default LinkToProfile;
