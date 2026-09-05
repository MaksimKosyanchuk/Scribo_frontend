import { useContext, useEffect, useMemo, useState } from "react";

import { AppContext } from "../../App";
import { getPosts, unwrapPostsResponse, POSTS_PAGE_LIMIT } from "../../api/posts.api";
import { getCategories } from "../../api/categories.api";

import "./Posts.scss";

import PostsFilters from "../../components/PostsFilters";
import NoPosts from "../NoPosts";
import PostCard from "../PostCard";
import Pagination from "../Ui/Pagination/index";

const PAGE_LIMIT = POSTS_PAGE_LIMIT;
const EMPTY_QUERY = {};

const followIds = (profile) =>
    (profile?.follows || []).map((item) => String(item._id || item).toLowerCase());

const Posts = ({
    query = EMPTY_QUERY,
    postsFilters = [],
    wait = false,
    posts: controlledPosts,
    setPosts: controlledSetPosts,
    isLoading: controlledLoading,
    page: controlledPage,
    pagesCount: controlledPagesCount,
    onPageChange,
    showFilters = true,
}) => {
    const isControlled = typeof onPageChange === "function";
    const { profile } = useContext(AppContext);

    const [filters, setFilters] = useState([]);
    const [categoryList, setCategoryList] = useState([]);
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [pagesCount, setPagesCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const queryKey = JSON.stringify(query);

    useEffect(() => {
        if (isControlled) {
            return;
        }

        const loadCategories = async () => {
            const result = await getCategories();
            setCategoryList(Array.isArray(result?.data) ? result.data : []);
        };

        loadCategories();
    }, [isControlled]);

    useEffect(() => {
        if (isControlled) {
            return;
        }

        const isPostsFiltersEmpty = postsFilters.length === 0;

        let uniqueFilters = categoryList.map((category) => ({
            ...category,
            isActive: isPostsFiltersEmpty
                ? true
                : (
                    postsFilters.includes("все") ||
                    postsFilters.includes(String(category._id).toLowerCase()) ||
                    postsFilters.includes(category._id)
                ),
        }));

        if (profile?._id) {
            uniqueFilters.unshift({
                _id: "subscription",
                name: "По подписке",
                isActive: postsFilters.includes("по подписке"),
                color: null,
                iconObject: null,
            });
        }

        uniqueFilters.unshift({
            _id: "all",
            name: "Все",
            isActive: isPostsFiltersEmpty || postsFilters.includes("все"),
            color: null,
            iconObject: null,
        });

        setFilters(uniqueFilters);
        setPage(1);
    }, [isControlled, categoryList, postsFilters, profile?._id]);

    const requestQuery = useMemo(() => {
        const extraQuery = JSON.parse(queryKey);
        const allActive = filters.find((f) => f._id === "all")?.isActive;
        const subscriptionFilterActive = filters.find((f) => f._id === "subscription")?.isActive;
        const categoryIds = filters
            .filter((f) => !["all", "subscription"].includes(f._id) && f.isActive)
            .map((f) => f._id);

        const next = {
            expand: "author,category",
            page,
            limit: PAGE_LIMIT,
            ...extraQuery,
        };

        if (subscriptionFilterActive) {
            const follows = followIds({ follows: profile?.follows });

            if (extraQuery.author) {
                const authors = (Array.isArray(extraQuery.author) ? extraQuery.author : [extraQuery.author])
                    .map((id) => String(id).toLowerCase());
                const intersect = authors.filter((id) => follows.includes(id));

                if (!intersect.length) {
                    return { empty: true };
                }

                next.author = intersect;
            }
            else if (!follows.length) {
                return { empty: true };
            }
            else {
                next.author = follows;
            }
        }

        if (filters.length && !allActive) {
            if (!categoryIds.length) {
                return { empty: true };
            }

            next.category = categoryIds;
        }

        return next;
    }, [filters, page, profile, queryKey]);

    useEffect(() => {
        if (isControlled || wait || !filters.length) {
            return;
        }

        const fetchPage = async () => {
            if (requestQuery.empty) {
                setPosts([]);
                setPagesCount(0);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            const response = await getPosts(requestQuery);
            const { items, pagination } = unwrapPostsResponse(response);

            if (response?.status === true || items.length) {
                setPosts(items);
                setPagesCount(pagination.pages || 0);
            }
            else {
                setPosts([]);
                setPagesCount(0);
            }

            setIsLoading(false);
        };

        fetchPage();
    }, [isControlled, requestQuery, wait, filters.length]);

    const handleFilters = (next) => {
        setFilters(next);
        setPage(1);
    };

    const list = isControlled ? (controlledPosts || []) : posts;
    const loading = isControlled ? Boolean(controlledLoading) : isLoading;
    const activePage = isControlled ? (controlledPage || 1) : page;
    const pages = isControlled ? (controlledPagesCount || 0) : pagesCount;
    const updatePosts = isControlled ? controlledSetPosts : setPosts;

    return (
        <div className="posts posts_columns" id="posts_column">
            {showFilters && !isControlled && (
                <PostsFilters
                    isLoading={loading && filters.length === 0}
                    filters={filters}
                    setFilters={handleFilters}
                />
            )}

            {loading && list.length === 0 ? (
                [0, 1, 2, 3, 4].map(index => (
                    <PostCard
                        key={index}
                        post={{ title: "Загрузка..." }}
                        isLoading={true}
                    />
                ))
            ) : list.length === 0 ? (
                <NoPosts />
            ) : (
                <Pagination
                    content={list}
                    page={activePage - 1}
                    pagesCount={pages}
                    onPageChange={(index) => {
                        if (isControlled) {
                            onPageChange(index + 1);
                            return;
                        }

                        setPage(index + 1);
                    }}
                >
                    {(visibleContent) => (
                        visibleContent.map(post => (
                            <PostCard
                                isLoading={false}
                                key={post._id}
                                post={post}
                                category={post.category}
                                setPosts={updatePosts}
                            />
                        ))
                    )}
                </Pagination>
            )}
        </div>
    );
};

export default Posts;
