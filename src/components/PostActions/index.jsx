import { useContext, useEffect, useRef, useState } from "react";
import { Link } from 'react-router-dom';

import { AppContext } from "../../App";

import { likePost, savePost } from "../../api/posts.api";
import { hasId, setIdPresent, withId, withoutId } from "../../utils/ids";

import "./PostActions.scss";

import BookMarkBorder from "../../assets/svg/bookmark-outline.svg?react";
import BookMarkFilled from "../../assets/svg/bookmark-filled.svg?react";
import ShareIcon from "../../assets/svg/share.svg?react";
import CommentIcon from "../../assets/svg/comment.svg?react";
import LikeIcon from "../../assets/svg/like-outline.svg?react";
import FilledLikeIcon from "../../assets/svg/like-filled.svg?react";

import Category from "../Category/index";
import Tooltip from "../Ui/Tooltip/index";

import Sceleton from "../Ui/Sceleton/Sceleton";

function isMobile() {
    return navigator.maxTouchPoints > 0;
}

async function share(id, showToast) {
    if(isMobile()){
        navigator.share({
            title: 'Заголовок',
            text: 'Текст',
            url: `https://${import.meta.env.VITE_APP_VERCEL_PROJECT_PRODUCTION_URL}/posts/${id}`
        })
    } else {
        try {
            await navigator.clipboard.writeText(`https://${import.meta.env.VITE_APP_VERCEL_PROJECT_PRODUCTION_URL}/posts/${id}`)
            showToast({message: "Скопировано!", type: "success" })
        } catch (err) {
            console.error(`Failed to copy: /posts/${id}`, err)
        }
    }
}

const PostActions = ({ className, article, setArticle, isLoading=false, showCategory = true }) => {
    const { profile, setProfile, showToast } = useContext(AppContext)
    const [isSaved, setIsSaved] = useState(hasId(profile?.saved_posts, article?._id));
    const [isSavingProcess, setIsSavingProcess] = useState(false)
    const likeBusy = useRef(false)
    const likeWanted = useRef(null)
    
    useEffect(() => {
        setIsSaved(hasId(profile?.saved_posts, article?._id));
    }, [profile, article?._id])

    const patchArticle = (updater) => {
        setArticle((prev) => {
            const current = prev && !Array.isArray(prev) && prev._id ? prev : article
            if (!current?._id) {
                return prev
            }
            return updater(current)
        })
    }

    const handleSavePost = async () => {
        if (!profile) {
            showToast({ message: "Чтобы сохранить пост, войдите в аккаунт!", type: "warning" })
            return
        }

        if (isSavingProcess || !article?._id) {
            return
        }

        setIsSavingProcess(true)
        const currentlySaved = hasId(profile.saved_posts, article._id)
        const result = await savePost(article._id, currentlySaved ? "DELETE" : "POST")

        if (result.status === true) {
            setProfile((prev) => ({
                ...prev,
                saved_posts: currentlySaved
                    ? withoutId(prev.saved_posts, article._id)
                    : withId(prev.saved_posts, article._id)
            }))
            setIsSaved(!currentlySaved)
            showToast({ message: currentlySaved ? "Убрано из сохранённых!" : "Сохранено!", type: "success" });
        } else if (result.statusCode === 401) {
            showToast({ message: "Чтобы сохранить пост, войдите в аккаунт!", type: "warning" })
        }
        setIsSavingProcess(false)
    };

    const getCommentsCount = (comments) => {
        if (!Array.isArray(comments)) return 0;

        return comments.reduce((count, comment) => {
            return count + 1 + getCommentsCount(comment.replies);
        }, 0);
    };

    const flushLike = async () => {
        if (likeBusy.current || !article?._id || !profile?._id) {
            return
        }

        likeBusy.current = true

        try {
            while (likeWanted.current !== null) {
                const wantLiked = likeWanted.current
                likeWanted.current = null
                const result = await likePost(article._id, wantLiked ? "POST" : "DELETE")

                if (likeWanted.current !== null) {
                    continue
                }

                if (result.status === true && result.data?.likes) {
                    patchArticle((current) => ({ ...current, likes: result.data.likes }))
                    showToast({ message: wantLiked ? "Поставлен лайк!" : "Лайк убран!", type: "success" })
                } else if (result.statusCode === 409) {
                    patchArticle((current) => ({
                        ...current,
                        likes: setIdPresent(current.likes, profile._id, wantLiked)
                    }))
                } else {
                    patchArticle((current) => ({
                        ...current,
                        likes: setIdPresent(current.likes, profile._id, !wantLiked)
                    }))
                }
            }
        } finally {
            likeBusy.current = false
            if (likeWanted.current !== null) {
                flushLike()
            }
        }
    }

    const doLike = () => {
        if (!profile) {
            showToast({ message: "Чтобы поставить лайк, войдите в аккаунт!", type: "warning" })
            return
        }

        patchArticle((current) => {
            const nextLiked = !hasId(current.likes, profile._id)
            likeWanted.current = nextLiked
            return {
                ...current,
                likes: setIdPresent(current.likes, profile._id, nextLiked)
            }
        })
        flushLike()
    }

    return (
        <div className={`post_actions ${className ?? ""}`}>
            <Sceleton isLoading={isLoading} rounded={true} className="post_actions_left_side">
                <div className="post_actions_left_side">
                    <Tooltip text={hasId(article.likes, profile?._id) ? "Убрать лайк" : "Поставить лайк"} clickable={true}>
                        <button type="button" className="post_actions_button app-transition" onClick={doLike}>
                            {
                                hasId(article.likes, profile?._id) ?
                                    <FilledLikeIcon />
                                :
                                    <LikeIcon />
                            }
                            <p>{article.likes?.length > 0 ? article.likes.length : ""}</p>
                        </button>
                    </Tooltip>
                    <Tooltip text={"Перейти к комментариям"} className="post_actions_comment"  clickable={true}>
                        <Link className="post_actions_button post_actions_comment app-transition" to={`/posts/${article._id}?comment=${article.comments?.length > 0 ? article.comments[0]._id : ""}`}>
                            <CommentIcon/>
                            {
                                article.comments?.length > 0 ?
                                    <p>
                                        {getCommentsCount(article.comments)}
                                    </p>
                                :
                                    <></>
                            }
                        </Link>
                    </Tooltip>
                    <Tooltip text={isSaved ? "Убрать из сохранённых" : "Сохранить"} clickable={true}>
                        <button type="button" className="post_actions_button app-transition" onClick={handleSavePost} disabled={isSavingProcess}>
                            {isSaved ? <BookMarkFilled /> : <BookMarkBorder />}
                        </button>
                    </Tooltip>
                    <Tooltip text={isMobile() ? "Поделиться" : "Скопировать ссылку"} clickable={true}>
                        <button className="post_actions_button app-transition" onClick={() => { share(article._id, showToast) }}>
                            <ShareIcon />
                        </button>
                    </Tooltip>
                </div>
            </Sceleton>
            {showCategory ? (
                <Sceleton isLoading={isLoading} rounded={true} className="post_actions_right_side">
                    <div className="post_actions_right_side">
                        <Category category={article.category} isActive={true}/>
                    </div>
                </Sceleton>
            ) : null}
        </div>
    )
};

export default PostActions;