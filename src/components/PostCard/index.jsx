import { memo, useCallback } from "react";
import { Link } from "react-router-dom";

import "./PostCard.scss";

import PostHeader from "../PostHeader";
import PostActions from "../PostActions";

const PostCard = ({
    post,
    category,
    setPosts,
}) => {

    const updatePost = useCallback((updatedPost) => {
        setPosts(prev =>
            prev.map(post =>
                post._id === updatedPost._id
                    ? updatedPost
                    : post
            )
        );
    }, [setPosts]);

    const deletePost = useCallback((id) => {
        setPosts(prev =>
            prev.filter(post => post._id !== id)
        );
    }, [setPosts]);

    return (
        <div className="posts_item app-transition">
            <PostHeader
                post={post}
                onDeletePost={deletePost}
            />

            <div className="posts_item_content">
                <h2 className="posts_item_title">
                    {post.title}
                </h2>
            </div>

            {post.featured_image && (
                <div className="posts_item_img">
                    <img
                        src={post.featured_image}
                        alt=""
                    />
                </div>
            )}

            <div className="posts_item_bottom">
                <PostActions
                    article={post}
                    category={category}
                    setArticle={updatePost}
                />
            </div>

            <Link
                className="posts_item_link"
                to={`/posts/${post._id}`}
            />
        </div>
    );
};

export default memo(PostCard);