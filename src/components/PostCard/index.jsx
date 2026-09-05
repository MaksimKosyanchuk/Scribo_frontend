import { memo, useCallback } from "react";
import { Link } from "react-router-dom";

import "./PostCard.scss";

import PostHeader from "../PostHeader";
import PostActions from "../PostActions";

import Sceleton from "../Ui/Sceleton/Sceleton";

const PostCard = ({
    isLoading = false,
    post,
    category,
    setPosts,
}) => {

    const updatePost = useCallback((next) => {
        setPosts((prev) =>
            prev.map((item) => {
                if (item._id !== post._id) {
                    return item
                }
                return typeof next === "function" ? next(item) : { ...item, ...next }
            })
        );
    }, [setPosts, post._id]);

    const deletePost = useCallback((id) => {
        setPosts(prev =>
            prev.filter(post => post._id !== id)
        );
    }, [setPosts]);

    return (
        <div className="posts_item section app-transition">
            <PostHeader
                post={post}
                isLoading={isLoading}
                onDeletePost={deletePost}
            />
            <Sceleton isLoading={isLoading} rounded={true} className="posts_item_content">
                <div className="posts_item_content">
                    <h2 className="posts_item_title">
                        {post.title}
                    </h2>
                </div>
            </Sceleton>

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
                    isLoading={isLoading}
                    category={category}
                    setArticle={updatePost}
                />
            </div>
            {
                !isLoading && (
                    <Link
                        className="posts_item_link"
                        to={`/posts/${post._id}`}
                    />
                )
            }
        </div>
    );
};

export default memo(PostCard);