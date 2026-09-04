import { useContext, useEffect, useState } from "react";

import { AppContext } from "../../App";

import "./Posts.scss";

import PostsFilters from "../../components/PostsFilters";
import NoPosts from "../NoPosts";
import PostCard from "../PostCard";
import Pagination from "../Ui/Pagination/index";

const Posts = ({ posts, setPosts, isLoading, posts_filters = [] }) => {
    const { profile } = useContext(AppContext);

    const [filters, setFilters] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);

    useEffect(() => {
        const isPostsFiltersEmpty = posts_filters.length === 0;

        let uniqueFilters = [
            ...new Map(
                posts
                    .filter(post => post.category)
                    .map(post => [post.category._id, post.category])
            ).values()
        ].map(category => ({
            ...category,
            is_active: isPostsFiltersEmpty
                ? true
                : (
                    posts_filters.includes("все") ||
                    posts_filters.includes(category._id)
                ),
        }));

        if (profile) {
            uniqueFilters.unshift({
                _id: "subscription",
                name: "По подписке",
                is_active: posts_filters.includes("по подписке"),
                color: null,
                iconObject: null,
            });
        }

        uniqueFilters.unshift({
            _id: "all",
            name: "Все",
            is_active: isPostsFiltersEmpty || posts_filters.includes("все"),
            color: null,
            iconObject: null,
        });

        setFilters(uniqueFilters);
    }, [posts, posts_filters, profile]);

    useEffect(() => {
        const subscriptionFilterActive =
            filters.find(f => f._id === "subscription")?.is_active;

        let updatedPosts = posts.filter(post =>
            filters.some(f =>
                f._id === post.category?._id && f.is_active
            )
        );

        if (subscriptionFilterActive) {
            updatedPosts = updatedPosts.filter(post =>
                profile?.follows
                    ?.map(id => id.toLowerCase())
                    ?.includes(post.author._id.toLowerCase())
            );
        }

        setFilteredPosts(updatedPosts);
    }, [filters, posts, profile?.follows]);

    return (
        <div className="posts posts_columns" id="posts_column">
            {isLoading ?
                (
                    <>
                        <PostsFilters
                            isLoading={true}
                            filters={[]}
                            setFilters={setFilters}
                        />

                        {[0, 5].map(index => (
                            <PostCard
                                key={index}
                                post={{ title: "Загрузка..." }}
                                isLoading={true}
                            />
                        ))}
                    </>
                )
            :
                posts && posts.length === 0 ? (
                    <NoPosts />
                ) : (
                    <>
                    <PostsFilters
                        isLoading={isLoading}
                        filters={filters}
                        setFilters={setFilters}
                    />

                    {filteredPosts.length === 0 ? (
                        <NoPosts />
                    ) : (
                        <Pagination content={filteredPosts} limit={5}>
                            {(visibleContent) => (
                                visibleContent.map(post => (
                                    <PostCard
                                        isLoading={isLoading}
                                        key={post._id}
                                        post={post}
                                        category={post.category}
                                        setPosts={setPosts}
                                    />
                                ))
                            )}
                        </Pagination>
                    )}
                </>
                )
            }
        </div>
    );
};

export default Posts;