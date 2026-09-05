import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useContext, useMemo } from "react";

import { AppContext } from "../../App.jsx";

import "./Profile.scss"

import { getUsers } from "../../api/users.api.js";
import { getPosts, unwrapPostsResponse, POSTS_PAGE_LIMIT } from "../../api/posts.api.js";
import { format_date_time, format_back } from "../../utils/format.js";

import { scrollTo } from "../../utils/navigation.js"

import Verified from "../../assets/svg/verified.svg?react";
import Calendar from "../../assets/svg/calendar-icon.svg?react";
import PostIcon from "../../assets/svg/post.svg?react";
import BookmarkOutline from "../../assets/svg/bookmark-outline.svg?react";
import SettingsIcon from "../../assets/svg/settings.svg?react";

import Sceleton from "../../components/Ui/Sceleton/Sceleton.jsx";

import Posts from "../../components/Posts/index.jsx"
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
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [postsPage, setPostsPage] = useState(1);
    const [postsPages, setPostsPages] = useState(0);
    const [isPostsLoading, setIsPostsLoading] = useState(true);
    const [followThisUser, setFollowThisUser] = useState(null);
    const [followAnotherUser, setFollowAnotherUser] = useState(null);

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

    const savedPostsIds = useMemo(() => {
        if (!user?._id) {
            return [];
        }

        const ids =
            user._id === profile?._id
                ? profile?.saved_posts
                : user?.saved_posts;

        return (ids || []).map((item) => String(item._id || item));
    }, [user?._id, user?.saved_posts, profile?._id, profile?.saved_posts]);

    useEffect(() => {
        setPostsPage(1);
        setPosts([]);
        setIsPostsLoading(true);
    }, [activeTab, user?._id]);

    useEffect(() => {
        if (!user?._id) {
            return;
        }

        let cancelled = false;

        const loadPosts = async () => {
            if (activeTab === 1 && savedPostsIds.length === 0) {
                setPosts([]);
                setPostsPages(0);
                setIsPostsLoading(false);
                return;
            }

            setIsPostsLoading(true);

            const query = {
                expand: "author,category",
                page: postsPage,
                limit: POSTS_PAGE_LIMIT
            };

            if (activeTab === 0) {
                query.author = user._id;
            }
            else {
                query._id = savedPostsIds;
            }

            const response = await getPosts(query);

            if (cancelled) {
                return;
            }

            const { items, pagination } = unwrapPostsResponse(response);

            if (response?.status === true) {
                setPosts(items);
                setPostsPages(pagination.pages || 0);
            }
            else {
                setPosts([]);
                setPostsPages(0);
            }

            setIsPostsLoading(false);
        };

        loadPosts();

        return () => {
            cancelled = true;
        };
    }, [user?._id, activeTab, postsPage, savedPostsIds]);

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
                <div className="profile_info_main">
                    <Sceleton
                        isLoading={isProfileLoading}
                        circle={true}
                        className="profile_info_avatar"
                    >
                        <div className="profile_info_avatar">
                            <img
                                src={user?.avatar ?? DefaultProfileAvatar}
                                alt="img"
                            />
                        </div>
                    </Sceleton>

                    <div className="profile_info_bio">
                        <Sceleton
                            isLoading={isProfileLoading}
                            rounded={true}
                            className="profile_info_nick"
                        >
                            <div className="profile_info_nick">
                                <p className="profile_info_nick_name">
                                    {user?.nick_name}
                                </p>
                                {user?.is_verified && (
                                    <Tooltip text="Подтвержденный аккаунт">
                                        <Verified
                                            className="profile_info_nick_verified verified-icon"
                                        />
                                    </Tooltip>
                                )}
                            </div>
                        </Sceleton>
                        {
                            user && !isProfileLoading && (
                                <RoleBadge user={user} />
                            )
                        }
                        {
                            user && user.email &&
                            <Sceleton
                                isLoading={isProfileLoading}
                                rounded={true}
                                className="profile_info_email"
                            >
                                <p className="profile_info_email">{user?.email}</p>
                            </Sceleton>
                        }
                        {(isProfileLoading || user?.description) ? (
                            <Sceleton
                                isLoading={isProfileLoading}
                                rounded={true}
                                className="profile_info_description"
                            >
                                <p className="profile_info_description">{user?.description}</p>
                            </Sceleton>
                        ) : null}
                        <Sceleton
                            isLoading={isProfileLoading}
                            rounded={true}
                            className="profile_info_date"
                        >
                            <div className="profile_info_date">
                                <Calendar className="app-transition" />
                                <Tooltip text={format_date_time(user?.created_date)}>
                                    <p>
                                        Регистрация: {format_back(user?.created_date)}
                                    </p>
                                </Tooltip>
                            </div>
                        </Sceleton>
                    </div>

                    <Sceleton
                        isLoading={isProfileLoading}
                        className="profile_info_action"
                    >
                        {
                            profile && profile._id === user?._id
                                ?
                                <ActionButton
                                    className="profile_info_action"
                                    onClick={open_settings}
                                >
                                    <SettingsIcon className="profile_info_action_icon" />
                                    Настройки
                                </ActionButton>
                                :
                                <FollowButton
                                    setNewData={setFollowThisUser}
                                    author_id={user?._id}
                                    class_name="profile_info_action"
                                />
                        }
                    </Sceleton>
                </div>

                <div className="profile_info_stats">
                    <Sceleton
                        isLoading={isProfileLoading}
                        className="profile_info_stat"
                    >
                        <button
                            type="button"
                            className="profile_info_stat app-transition"
                            onClick={() => scrollTo("posts_column", "start")}
                        >
                            <h1>{posts?.length ?? "0"}</h1>
                            <p>постов</p>
                        </button>
                    </Sceleton>
                    <Sceleton
                        isLoading={isProfileLoading}
                        className="profile_info_stat"
                    >
                        <button
                            type="button"
                            className="profile_info_stat app-transition"
                            onClick={open_followers}
                        >
                            <h1>{user?.followers?.length ?? "0"}</h1>
                            <p>подписчиков</p>
                        </button>
                    </Sceleton>
                    <Sceleton
                        isLoading={isProfileLoading}
                        className="profile_info_stat"
                    >
                        <button
                            type="button"
                            className="profile_info_stat app-transition"
                            onClick={open_follows}
                        >
                            <h1>{user?.follows?.length ?? "0"}</h1>
                            <p>подписок</p>
                        </button>
                    </Sceleton>
                </div>
            </div>

            <div className="profile_feed">
                <Sceleton
                    isLoading={isProfileLoading}
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
                                </>,
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
                    <Posts
                        posts={posts}
                        setPosts={setPosts}
                        isLoading={isProfileLoading || isPostsLoading}
                        page={postsPage}
                        pagesCount={postsPages}
                        onPageChange={setPostsPage}
                        showFilters={false}
                    />
                </div>
            </div>
        </div>
    );
};

export default Profile;