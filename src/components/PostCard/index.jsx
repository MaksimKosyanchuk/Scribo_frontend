import { memo, useCallback } from "react";
import { Link } from "react-router-dom";

import "./PostCard.scss";

import PostHeader from "../PostHeader";
import PostActions from "../PostActions";

import Sceleton from "../Ui/Sceleton/Sceleton";

const PostCard = ({
    isLoading = false,
    post,
    setPosts,
}) => {
    const updatePost = useCallback((next) => {
        setPosts((prev) =>
            prev.map((item) => {
                if (item._id !== post._id) {
                    return item;
                }
                return typeof next === "function" ? next(item) : { ...item, ...next };
            })
        );
    }, [setPosts, post._id]);

    const deletePost = useCallback((id) => {
        setPosts((prev) => prev.filter((item) => item._id !== id));
    }, [setPosts]);

    const body = (
        <>
            <Sceleton isLoading={isLoading} rounded={true} section={false} className="posts_item_title">
                <h2 className="posts_item_title">{post.title}</h2>
            </Sceleton>
            {post.featured_image ? (
                <div className="posts_item_img">
                    <img src={post.featured_image} alt="" />
                </div>
            ) : null}
        </>
    );

    return (
        <article className="posts_item app-transition">
            <PostHeader
                post={post}
                isLoading={isLoading}
                onDeletePost={deletePost}
            />
            {isLoading || !post._id ? (
                <div className="posts_item_main">{body}</div>
            ) : (
                <Link className="posts_item_main" to={`/posts/${post._id}`}>
                    {body}
                </Link>
            )}
            <PostActions
                article={post}
                isLoading={isLoading}
                setArticle={updatePost}
                showCategory={false}
            />
        </article>
    );
};

export default memo(PostCard);
