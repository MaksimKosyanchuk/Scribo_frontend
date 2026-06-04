import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useContext, useMemo } from "react";
import { AppContext } from "../../App.js";
import { API_URL } from "../../config";
import { getPosts } from "../../api/posts.api.js";
import { getUsers } from "../../api/users.api.js";
import Posts from "../../components/Posts/index.jsx"
import Loading from "../../components/Ui/Loading/index.jsx";
import Author from "../../components/Author"
import "./Profile.scss"
import DefaultProfileAvatar from "../../assets/images/default-profile-avatar.png"
import { ReactComponent as Verified } from "../../assets/svg/verified-icon.svg";
import { ReactComponent as Calendar } from "../../assets/svg/calendar-icon.svg";
import FollowButton from "../../components/FollowButton";
import ActionButton from "../../components/Ui/ActionButton";
import ChipButton from "../../components/Ui/ChipButton";
import SwitchBar from "../../components/Ui/SwitchBar";

const Profile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { profile, setProfile, showModalWindow } = useContext(AppContext);
    const [activeTab, setActiveTab] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [posts, setPosts] = useState([]);
    const [activePosts, setActivePosts] = useState([]);
    const [user, setUser] = useState(null);
    const [followThisUser, setFollowThisUser] = useState(null);
    const [followAnotherUser, setFollowAnotherUser] = useState(null);

    const posts_filters = useMemo( () => [], [])

    useEffect(() => {
        setProfile({
            ...profile,
            follows: followThisUser?.follower?.follows
        })
        setUser({
            ...user,
            followers: followThisUser?.followed?.followers,
            follows: followThisUser?.followed?.follows
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [followThisUser])

    useEffect(() => {
        setProfile({
            ...profile,
            follows: followAnotherUser?.follower?.follows
        })
        
        if(user?._id === profile?._id) {
            setUser({
                ...user,
                follows: followAnotherUser?.follower?.follows,
                followers: followAnotherUser?.follower?.followers
            })
        }
    }, [followAnotherUser])

    useEffect(() => {
        const getUser = async () => {
            try {
                let response = await fetch(`${API_URL}/api/users/${id}`);
                let findNeededUser = await response.json();
                setActiveTab(0);

                if (findNeededUser.status === false) {
                    navigate('/404');
                } else {
                    setUser(findNeededUser.data);
                }
            } catch (e) {
                console.log(e);
                navigate('/404');
            }
        };
        getUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    useEffect(() => {
        if (user && user._id) {
            fetchPosts({ author: user._id }).then(data => setPosts(data));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?._id]);

    useEffect(() => {
        if (activeTab === 0) {
            setActivePosts(posts);
        } else if (activeTab === 1) {
            if(profile && user?._id === profile?._id) {
                fetchPosts({ _id: profile?.saved_posts }).then((posts) => setActivePosts(posts));
            }
            else {
                fetchPosts({ _id: user?.saved_posts }).then((posts) => setActivePosts(posts));
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, posts, profile?.saved_posts]);

    const fetchPosts = async (query) => {
        setIsLoading(true);
        const response = await getPosts(query);
        setIsLoading(false);
        return response.status === true ? response.data : [];
    };

    const open_settings = () => {
        navigate('/settings');
    };

    const fetchUsers = async (query) => {
        const response = await getUsers(query);
        return response.status === true ? response.data : [];
    }

    const open_follows = async () => {
        const follows =  user?.follows?.map(item => ({ _id: item }));
        const result = await fetchUsers(follows)

        showModalWindow(
            {
                title: `Подписки`,
                content: result.map(authorData => (
                    <div key={authorData._id} className="modal_window_body_content_user">
                        <Author author_data={authorData} />
                        {
                            profile && profile._id === authorData._id ?
                                <></>
                            :
                                <FollowButton setNewData={setFollowAnotherUser} author_id={authorData._id}/>
                        }
                    </div>
                  ))
            }
        )
    }

    const open_followers = async () => {
        const follows =  user?.followers?.map(item => ({ _id: item }));
        const result = await fetchUsers(follows)
        
        showModalWindow(
            {
                title: `Подписчики`,
                content: result.map(authorData => (
                    <div key={authorData?._id } className="modal_window_body_content_user">
                        <Author author_data={authorData} />
                        {
                            profile && profile._id === authorData._id ?
                                <></>
                            :
                                <FollowButton setNewData={setFollowAnotherUser} author_id={authorData._id}/>
                        }
                    </div>
                  ))
            }
        )
    }

    if (!user) {
        return <Loading />;
    }

    const format_date = (date) => {
        date = new Date(date);

        const months = [
            "января", "февраля", "марта", "апреля", 
            "мая", "июня", "июля", "августа", 
            "сентября", "октября", "ноября", "декабря"
          ];

        const day = date.getDate().toString().padStart(2, '0');
        const month = months[date.getMonth()];
        const year = date.getFullYear();

        return `${day} ${month} ${year} года`
    }

    return (
        <div className="profile">
            <div className="profile_info">
                <div className="profile_info_top">
                    <div className="profile_info_top_avatar">
                        <img src={user?.avatar ?? DefaultProfileAvatar} alt="img" />
                    </div>
                    <div className="profile_info_top_right_side">
                        <div></div>
                        <div className="profile_info_top_right_side_elements">
                            <p>{posts?.length ?? "0"} постов</p>
                            <ChipButton onClick={ open_followers }>
                                {user?.followers?.length ?? "0"} подписчиков
                            </ChipButton>
                            <ChipButton onClick={ open_follows }>
                                {user?.follows?.length ?? "0"} подписок
                            </ChipButton>
                        </div>
                        {profile && profile._id === user._id ? (
                            <ActionButton className="profile_info_top_right_side_button" onClick={open_settings}>
                                Настройки
                            </ActionButton>
                        ) 
                        :
                            <FollowButton setNewData={setFollowThisUser} author_id={user?._id} class_name={"profile_info_top_right_side_button"}/> 
                        }
                    </div>
                </div>
                <div className="profile_info_bottom">
                    <div className="profile_info_bottom_nick">
                        <p
                            className={
                                "profile_info_bottom_nick_name" +
                                (user && user.is_admin ? " profile_info_bottom_nick_name_admin" : "")
                            }
                        >
                            {user.nick_name}
                        </p>
                        {user && user.is_verified ? <Verified className="profile_info_bottom_nick_verified verified-icon" /> : null}
                    </div>
                    <div className="profile_info_bottom_administrator">
                        {
                            user?.is_admin ? 
                                <p>Administrator</p>
                            :
                                <></>
                        }
                    </div>
                    {user?.is_email_public && (
                        <div className="profile_info_bottom_email">
                            <p>{user.email}</p>
                        </div>
                    )}
                    {user?.description && (
                        <div className="profile_info_bottom_description">
                            <p>{user.description}</p>
                        </div>
                    )}
                    <div className="profile_info_bottom_registration_date">
                        <Calendar className="app-transition" />
                        <p>Регистрация: {format_date(user.created_date)}.</p>
                    </div>
                </div>
            </div>
            <div className="profile_tab_list app-transition">
                <SwitchBar
                    items={["Посты", "Сохранённые"]}
                    active_index={activeTab}
                    setActiveIndex={setActiveTab}
                />
            </div>
            <div className="profile_posts">
                <Posts posts_filters={posts_filters} posts={activePosts} isLoading={isLoading} />
            </div>
        </div>
    );
};

export default Profile;