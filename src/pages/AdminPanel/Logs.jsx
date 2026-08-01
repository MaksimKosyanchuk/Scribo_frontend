import { getAllLogs } from "../../api/logs.api";
import { getUsers } from "../../api/users.api";

import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

import { AppContext } from "../../App";

import { format_back, format_date_time } from "../../utils/format";
import { getCategories } from "../../api/categories.api";
import { getPosts } from "../../api/posts.api";

import { ReactComponent as PostIcon } from "../../assets/svg/post.svg";
import { ReactComponent as EditIcon } from "../../assets/svg/edit.svg";
import { ReactComponent as PlusIcon } from "../../assets/svg/plus-icon.svg"; 
import { ReactComponent as DeleteIcon } from "../../assets/svg/delete.svg";
import { ReactComponent as NewUserIcon } from "../../assets/svg/new-user.svg";
import { ReactComponent as RedirectIcon } from "../../assets/svg/redirect.svg";
import { ReactComponent as TagIcon } from "../../assets/svg/tag.svg";
import { ReactComponent as FilterIcon } from "../../assets/svg/filter.svg";

import SearchSearch from "../../components/Ui/SearchSelect";
import CancelButton from "../../components/Ui/CancelButton";
import Loading from "../../components/Ui/Loading";
import Tooltip from "../../components/Ui/Tooltip"; 
import UserBadge from "../../components/UserBadge/index";
import Category from "../../components/Category/index";
import Popup from "../../components/Ui/Popup";
import ChipButton from "../../components/Ui/ChipButton";

import Pagination from "../../components/Ui/Pagination";
import "./Logs.scss";


const formatTime = (date) => {
    return (
        <Tooltip text={format_date_time(date)}>
            <p>{format_back(date)}</p>
        </Tooltip>
    )

};

const LogLayout = ({ action, user, time, children, setFilter, log }) => {
    return (
        <div className={`admin_panel_content_logs_page_item admin_panel_content_logs_page_item_${action?.className}`}>
            <div className="admin_panel_content_logs_page_item_left">
                <UserEntity className="test" id={log.data.user} data={user} setFilter={setFilter} />
            </div>
            <div className="admin_panel_content_logs_page_item_center">
                {children}
            </div>
            <div className="admin_panel_content_logs_page_item_right">
                {time && formatTime(time)}
            </div>
        </div>
    )
}

const UserEntity = ({ id, data, setFilter }) => {
    const navigate = useNavigate();
    const { showToast } = useContext(AppContext);

    return (
        <Popup body={[
            {
                title: "Перейти в профиль",
                onClick: () => {
                    data ? navigate(`/users/${data.nick_name}`) : showToast({
                        type: "error",
                        message: "Пользователь не найден"
                    })
                },
                icon: <RedirectIcon/>
            },
            {
                title: "Просмотреть действия пользователя",
                onClick: () => {
                    setFilter({
                        type: "user",
                        id: id
                    })
                },
                icon: <FilterIcon/>
            }
        ]}>
            <div className="admin_panel_content_logs_page_item_entity admin_panel_content_logs_page_item_entity_user">
                {
                    data ?
                        <UserBadge asLink={false} data={data} />
                        :
                        <>
                            <UserBadge asLink={false} data={{ nick_name: "" }} />
                            <div className="admin_panel_content_logs_page_item_entity_deleted">
                                <p> 
                                    DELETED
                                </p>
                            </div>
                        </>
                }
            </div>
        </Popup>
    )
}

const PostEntity = ({ id, data, setFilter }) => {
    const navigate = useNavigate();
    const { showToast } = useContext(AppContext);

    return (
        <Popup body={[
            {
                title: "Перейти к посту",
                onClick: () => {
                    data ? navigate(`/posts/${data._id}`) : showToast({
                        type: "error",
                        message: "Пост не найден"
                    })
                },
                icon: <RedirectIcon/>

            },
            {
                title: "Просмотреть историю поста",
                onClick: () => {
                    setFilter({
                        type: "post",
                        id: id
                    })
                },
                icon: <FilterIcon/>
            }
        ]}>
            <div className="admin_panel_content_logs_page_item_entity admin_panel_content_logs_page_item_entity_post">
                <PostIcon/>
                {
                    data ? 
                        <p>{data.title}</p> :
                    <>
                        <div className="admin_panel_content_logs_page_item_entity_post_deleted">
                            <p>No longer exists</p>
                        </div>
                    </>
                }
            </div>
        </Popup>
    )
}

const CategoryEntity = ({ id, data, setFilter }) => {
    const navigate = useNavigate();
    const { showToast } = useContext(AppContext);

    return (
        <Popup body={[
            {
                title: "Перейти к категории",
                onClick: () => {
                    data ? navigate(`/posts/?filter=${data._id}`) : showToast({
                        type: "error",
                        message: "Категория не найдена"
                    })

                },
                icon: <RedirectIcon/>

            },
            {
                title: "Просмотреть историю категории",
                onClick: () => {
                    setFilter({
                        type: "category",
                        id: id
                    })
                },
                icon: <FilterIcon/>
            }
        ]}>
            <div className="admin_panel_content_logs_page_item_entity admin_panel_content_logs_page_item_entity_category">
                {
                    data ? 
                        <Category category={data} is_active={true} onClick={() => {}} /> :
                    <div className="admin_panel_content_logs_page_item_entity admin_panel_content_logs_page_item_entity_category_deleted">
                    
                        <ChipButton >
                            <TagIcon/>
                            <p>
                                No longer exist
                            </p>
                        </ChipButton>
                    </div>
                }
            </div>
        </Popup>
    )
}

const LOG_RENDERERS = {
    create_post: ({ log, users, posts, setFilter }) => (
        <>
            <div className="admin_panel_content_logs_page_item_message">
                <div className="admin_panel_content_logs_page_item_message_icon">
                    <PlusIcon/>
                </div>
                <p>Создал пост</p>
            </div>
            <PostEntity id={log.data.post} data={posts.find(p => p._id === log.data.post)} setFilter={setFilter} />
        </> 
    ),

    update_post: ({ log, users, posts, setFilter }) => (
        <>
            <div className="admin_panel_content_logs_page_item_message">
                <div className="admin_panel_content_logs_page_item_message_icon">
                    <EditIcon/>
                </div>
                <p>Отредактировал пост</p>
            </div>
            <PostEntity id={log.data.post} data={posts.find(p => p._id === log.data.post)} setFilter={setFilter} />
        </>
    ),
    
    delete_post: ({ log, users, posts, setFilter }) => (
        <>
             <div className="admin_panel_content_logs_page_item_message">
                <div className="admin_panel_content_logs_page_item_message_icon">
                    <DeleteIcon/>
                </div>
                <p>Удалил пост</p>
            </div>
            <PostEntity id={log.data.post} data={posts.find(p => p._id === log.data.post)} setFilter={setFilter} />
        </>
    ),

    register: ({ log, users, setFilter }) => (
        <>
            <div className="admin_panel_content_logs_page_item_message">
                <div className="admin_panel_content_logs_page_item_message_icon">
                    <NewUserIcon/>
                </div>
                <p>Зарегестрировался</p>
            </div>
            <div className="admin_panel_content_logs_page_item_entity">
            </div>
        </>
    ),

    create_category: ({ log, users, categories, setFilter }) => (
        <>
            <div className="admin_panel_content_logs_page_item_message">
                <div className="admin_panel_content_logs_page_item_message_icon">
                    <PlusIcon/>
                </div>
                <p>Создал категорию</p>
            </div>
            <CategoryEntity id={log.data.category} data={categories.find(cat => cat._id === log.data.category)} setFilter={setFilter} />
        </>
    ),

    update_category: ({ log, users, categories, setFilter }) => (
        <>
            <div className="admin_panel_content_logs_page_item_message">
                <div className="admin_panel_content_logs_page_item_message_icon">
                    <EditIcon/>
                </div>
                <p>Отредактировал категорию</p>
            </div>
            <CategoryEntity id={log.data.category} data={categories.find(cat => cat._id === log.data.category)} setFilter={setFilter} />
        </>
    ),

    delete_category: ({ log, users, categories, setFilter }) => (
        <>
            <div className="admin_panel_content_logs_page_item_message">
                <div className="admin_panel_content_logs_page_item_message_icon">
                    <DeleteIcon/>
                </div>
                <p>Удалил категорию</p>
            </div>
            <CategoryEntity id={log.data.category} data={categories.find(cat => cat._id === log.data.category)} setFilter={setFilter} />
        </>
    )
};

const ACTIONS = {
    create_post: {
        title: "Создание поста",
        className: "create_post",
        icon: PlusIcon
    },

    update_post: {
        title: "Редактирование поста",
        className: "update_post",
        icon: EditIcon
    },

    delete_post: {
        title: "Удаление поста",
        className: "delete_post",
        icon: DeleteIcon
    },

    register: {
        title: "Регистрация",
        className: "register",
        icon: NewUserIcon
    },

    create_category: {
        title: "Создание категории",
        className: "create_category",
        icon: PlusIcon
    },
    
    update_category: {
        title: "Редактирование категории",
        className: "update_category",
        icon: EditIcon
    },

    delete_category: {
        title: "Удаление категории",
        className: "delete_category",
        icon: DeleteIcon
    }
};


const LogsPage = () => {
    const [logs, setLogs] = useState([]);
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [filter, setFilter] = useState({
        type: null,
        id: null
    });

    const { showToast } = useContext(AppContext);

    useEffect(() => {
        const fetchData = async () => {

            const [logsResult] = await Promise.all([
                getAllLogs(),
            ]);

            const [categoriesResult] = await Promise.all([
                getCategories()
            ]);

            const postsResult = await getPosts();

            if(postsResult.status ) {
                setPosts(postsResult.data);
            }

            setCategories(categoriesResult.data);

            if (!logsResult.status) {
                showToast({
                    type: "error",
                    message: logsResult.message
                });

                setLoading(false);
                return;
            }

            setLogs(
                [...logsResult.data].sort(
                    (a, b) =>
                        new Date(b.date_time) -
                        new Date(a.date_time)
                )
            );

            setLoading(false);

        };

        fetchData();

    }, [showToast]);
    
    useEffect(() => {
        const fetchUsers = async () => {
            const userIds = [
                ...new Set(
                    logs
                        .map(log => log.data?.user)
                        .filter(Boolean)
                )
            ];
    
            const usersResult = await getUsers(
                userIds.map(_id => ({ _id }))
            )

            if(usersResult.status) {
                setUsers(usersResult.data);
            }
        } 

        fetchUsers();
    },[logs]);

    const filteredLogs = logs.filter(log => {
        if (!filter.id) return true;

        switch (filter.type) {
            case "user":
                return log.data?.user === filter.id;

            case "post":
                return log.data?.post === filter.id;
            case "category":
                return log.data?.category === filter.id;
            default:
                return true;
        }
    });

    if (loading) {

        return (
            <Loading size={40} />
        );

    }

    const search_select_options = [];

    logs.forEach(log => {
        if (
            log.data?.user &&
            !search_select_options.some(
                option => 
                    option.value.type === "user" &&
                    option.value.value === log.data.user
            )
        ) {
            const user = users.find(u => u._id === log.data.user);

            search_select_options.push({
                value: {
                    type: "user",
                    value: log.data.user
                },
                name: user?.nick_name ?? log.data.user,
                _id: log.data.user,
                render: () => (
                    <UserEntity
                        id={log.data.user}
                        data={user}
                        setFilter={() => {}}
                    />
                )
            });
        }

        else if (
            log.data?.post &&
            !search_select_options.some(
                option =>
                    option.value.type === "post" &&
                    option.value.value === log.data.post
            )
        ) {
            const post = posts.find(p => p._id === log.data.post);

            search_select_options.push({
                value: {
                    type: "post",
                    value: log.data.post
                },
                name: post?.title ?? log.data.post,
                _id: log.data.post,
                render: () => (
                    <PostEntity
                        id={log.data.post}
                        data={post}
                        setFilter={() => {}}
                    />
                )
            });
        }
        else if(log.data?.category && !search_select_options.some(
            option =>
                option.value.type === "category" &&
                option.value.value === log.data.category
        )) {
            const category = categories.find(c => c._id === log.data.category);

            search_select_options.push({
                value: {
                    type: "category",
                    value: log.data.category
                },
                name: category?.name ?? log.data.category,
                _id: log.data.category,
                render: () => (
                    <CategoryEntity
                        id={log.data.category}
                        data={category}
                        setFilter={() => {}}
                    />
                )
            });
        }
    });

    return (
        <div className="admin_panel_content_logs_page">
            {
                filter.type ?
                    <div className="admin_panel_content_logs_page_filter">
                        <FilterIcon className="admin_panel_content_logs_page_filter_icon" />
                        {filter.type === "user" && <UserEntity id={filter.id} data={users.find(u => u._id === filter.id)} setFilter={setFilter} />}
                        {filter.type === "post" && <PostEntity id={filter.id} data={posts.find(p => p._id === filter.id)} setFilter={setFilter} />}
                        {filter.type === "category" && <CategoryEntity id={filter.id} data={categories.find(c => c._id === filter.id)} setFilter={setFilter} />}
                        <CancelButton onClick={() => setFilter({ type: null, id: null })}>Отмена</CancelButton>
                    </div>
                :
                    <SearchSearch options={search_select_options} onSetValue={(value) => {setFilter({ type: value.type, id: value.value })}}/>
            }
            {
                <Pagination content={filteredLogs} limit={8}>
                    {(visibleContent) => (
                        visibleContent.map(log => {
                            const Renderer = LOG_RENDERERS[log.type];
                            const action = ACTIONS[log.type];

                            return (
                                <LogLayout
                                    key={log._id}
                                    action={action}
                                    setFilter={setFilter}
                                    user={users.find(user => user._id === log.data.user)}
                                    log={log}
                                    time={log.date_time}
                                >
                                    {Renderer?.({
                                        log,
                                        users,
                                        posts,
                                        categories,
                                        setFilter
                                    })}
                                </LogLayout>
                            );
                        })
                    )}
                </Pagination>
            }
        </div>
    );

};

export default LogsPage;