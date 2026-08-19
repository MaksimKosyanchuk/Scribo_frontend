import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useContext, useMemo } from "react";

import { AppContext } from "../../App.jsx";

import "./Profile.scss"

import { getPosts } from "../../api/posts.api.js";
import { getUsers } from "../../api/users.api.js";
import { format_date_time, format_back } from "../../utils/format.js";

import { scrollTo } from "../../utils/navigation.js"

import Verified from "../../assets/svg/verified.svg?react";
import Calendar from "../../assets/svg/calendar-icon.svg?react";
import PostIcon from "../../assets/svg/post.svg?react";
import BookmarkOutline from "../../assets/svg/bookmark-outline.svg?react";
import SettingsIcon from "../../assets/svg/settings.svg?react";

import Sceleton from "../../components/Ui/Sceleton/Sceleton.jsx";

import Posts from "../../components/Posts/index.jsx"
import Loading from "../../components/Ui/Loading/index.jsx";
import UserBadge from "../../components/UserBadge/index.jsx"
import DefaultProfileAvatar from "../../assets/images/default-profile-avatar.png"
import FollowButton from "../../components/FollowButton";
import ActionButton from "../../components/Ui/ActionButton";
import SwitchBar from "../../components/Ui/SwitchBar";
import Tooltip from "../../components/Ui/Tooltip/index";
import RoleBadge from "../../components/RoleBadge/index";

const Profile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { profile, setProfile, showModalWindow } = useContext(AppContext);
    const [ isProfileLoading, setIsProfileLoading ] = useState(true);
    const [ activeTab, setActiveTab ] = useState(0);
    const [ isPostsLoading, setIsPostsLoading ] = useState(true);
    const [posts, setPosts] = useState([]);
    const [savedPosts, setSavedPosts] = useState([]);
    const [activePosts, setActivePosts] = useState([]);
    const [user, setUser] = useState(null);
    const [followThisUser, setFollowThisUser] = useState(null);
    const [followAnotherUser, setFollowAnotherUser] = useState(null);

    const posts_filters = useMemo( () => [], [])

    useEffect(() => {
        if (!followThisUser) return;

        setProfile(prevProfile => ({
            ...prevProfile,
            follows: followThisUser?.follower?.follows
        }));

        setUser(prevUser => {
            if (!prevUser) return prevUser;

            return {
                ...prevUser,
                followers: followThisUser?.followed?.followers,
                follows: followThisUser?.followed?.follows
            };
        });
    }, [followThisUser, setProfile]);

    useEffect(() => {
        if (!followAnotherUser) return;

        setProfile(prevProfile => ({
            ...prevProfile,
            follows: followAnotherUser?.follower?.follows
        }));

        setUser(prevUser => {
            if (!prevUser) return prevUser;

            if (prevUser._id !== profile?._id) {
                return prevUser;
            }

            return {
                ...prevUser,
                follows: followAnotherUser?.follower?.follows,
                followers: followAnotherUser?.follower?.followers
            };
        });
    }, [followAnotherUser, profile?._id, setProfile]);

    useEffect(() => {
        const getUser = async () => {
            setIsProfileLoading(true);
            const findNeededUser = await getUsers([{ nick_name: id }]);
            setActiveTab(0);

            if (findNeededUser.status === false) {
                navigate('/404');
            } else {
                setUser(findNeededUser.data[0]);
            }
            setIsProfileLoading(false);
        };
        getUser();
    }, [id, navigate]);

    useEffect(() => {
        if (!user?._id) return;

        const loadPosts = async () => {
            setIsPostsLoading(true);
            const posts = await fetchPosts({
                author: user._id
            });
            setIsPostsLoading(false);

            setPosts(posts);
        };

        loadPosts();
    }, [user?._id]);

    useEffect(() => {
        if (!user?._id) return;

        const loadSavedPosts = async () => {
            const savedPostsIds =
                user._id === profile?._id
                    ? profile?.saved_posts
                    : user?.saved_posts;

            if (!savedPostsIds?.length) {
                setSavedPosts([]);
                return;
            }

            const savedPosts = await fetchPosts({
                _id: savedPostsIds
            });

            setSavedPosts(savedPosts);
        };

        loadSavedPosts();
    }, [
        user?._id,
        profile?._id,
        profile?.saved_posts,
        user?.saved_posts
    ]);

    useEffect(() => {
        setActivePosts(
            activeTab === 0
                ? posts
                : savedPosts
        );
    }, [activeTab, posts, savedPosts]);

    const fetchPosts = async (query) => {
        setIsPostsLoading(true);
        query.expand = "author,category";
        const response = await getPosts(query);
        setIsPostsLoading(false);
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
                        <UserBadge data={authorData} />
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
                        <UserBadge data={authorData} />
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


    return (
        <div className="profile">
            <div className="profile_info section app-transition">
                <div className="profile_info_left">
                    <Sceleton
                        isLoading={isProfileLoading || isPostsLoading}
                        circle={true}
                        className="profile_info_left_avatar"
                    >
                        <div className="profile_info_left_avatar">
                            <img
                                src={user?.avatar ?? DefaultProfileAvatar}
                                alt="img"
                            />
                        </div>
                    </Sceleton>

                    <div className="profile_info_middle">
                    </div>
                </div>


                <div className="profile_info_middle">

                    <Sceleton
                        isLoading={isProfileLoading || isPostsLoading}
                        rounded={true}
                        className="profile_info_bottom_nick"
                    >
                        <div className="profile_info_bottom_nick">
                            <p className="profile_info_bottom_nick_name">
                                {user?.nick_name}
                            </p>

                            {user?.is_verified && (
                                <Tooltip text="Подтвержденный аккаунт">
                                    <Verified
                                        className="profile_info_bottom_nick_verified verified-icon"
                                    />
                                </Tooltip>
                            )}
                        </div>
                    </Sceleton>

                    {
                        user && !isProfileLoading && !isPostsLoading && (
                            <RoleBadge user={user} />
                        )
                    }

                    <Sceleton
                        isLoading={isProfileLoading || isPostsLoading}
                        rounded={true}
                        className="profile_info_bottom_email"
                    >
                        <div className="profile_info_bottom_email">
                            <p>{user?.email}</p>
                        </div>
                    </Sceleton>


                    <Sceleton
                        isLoading={isProfileLoading || isPostsLoading}
                        rounded={true}
                        className="profile_info_bottom_description"
                    >
                        <div className="profile_info_bottom_description">
                            <p>{user?.description}</p>
                        </div>
                    </Sceleton>


                    <Sceleton
                        isLoading={isProfileLoading || isPostsLoading}
                        rounded={true}
                        className="profile_info_bottom_registration_date"
                    >
                        <div className="profile_info_bottom_registration_date">
                            <Calendar className="app-transition" />

                            <Tooltip text={format_date_time(user?.created_date)}>
                                <p>
                                    Регистрация: {format_back(user?.created_date)}
                                </p>
                            </Tooltip>
                        </div>
                    </Sceleton>

                </div>


                <div className="profile_info_right">

                    <div className="profile_info_right_top">

                        <Sceleton
                            isLoading={isProfileLoading || isPostsLoading}
                            className="profile_info_right_top_item"
                        >
                            <div
                                className="profile_info_right_top_item app-transition"
                                onClick={() => scrollTo("posts_column", "start")}
                            >
                                <h1>{posts?.length ?? "0"}</h1>
                                <p>постов</p>
                            </div>
                        </Sceleton>


                        <Sceleton
                            isLoading={isProfileLoading || isPostsLoading}
                            className="profile_info_right_top_item"
                        >
                            <div
                                className="profile_info_right_top_item app-transition"
                                onClick={open_followers}
                            >
                                <h1>
                                    {user?.followers?.length ?? "0"}
                                </h1>
                                <p>
                                    подписчиков
                                </p>
                            </div>
                        </Sceleton>


                        <Sceleton
                            isLoading={isProfileLoading || isPostsLoading}
                            className="profile_info_right_top_item"
                        >
                            <div
                                className="profile_info_right_top_item app-transition"
                                onClick={open_follows}
                            >
                                <h1>
                                    {user?.follows?.length ?? "0"}
                                </h1>
                                <p>
                                    подписок
                                </p>
                            </div>
                        </Sceleton>

                    </div>


                    <Sceleton
                        isLoading={isProfileLoading || isPostsLoading}
                        className="profile_info_right_top_button"
                    >
                        {
                            profile && profile._id === user?._id
                                ?
                                <ActionButton
                                    className="profile_info_right_top_button"
                                    onClick={open_settings}
                                >
                                    <SettingsIcon className="profile_info_right_side_button_icon" />
                                    Настройки
                                </ActionButton>
                                :
                                <FollowButton
                                    setNewData={setFollowThisUser}
                                    author_id={user?._id}
                                    class_name="profile_info_top_right_side_button"
                                />
                        }
                    </Sceleton>
                </div>
            </div>
            <Sceleton
                isLoading={isProfileLoading || isPostsLoading}
                rounded={true}
                section={false}
                className="profile_tab_list"
            >
                <div className="profile_tab_list app-transition">
                    <SwitchBar
                        items={[
                            
                            <>
                                <PostIcon />
                                Посты
                            </>
                            ,
                            <>
                                <BookmarkOutline />
                                Избранные
                            </>
                        ]}
                        active_index={activeTab}
                        setActiveIndex={setActiveTab}
                    />
                </div>
            </Sceleton>
            <div className="profile_posts">
                <Posts posts_filters={posts_filters} posts={activePosts} setPosts={setPosts} isLoading={isPostsLoading} />
            </div>
        </div>
    );
};

export default Profile;