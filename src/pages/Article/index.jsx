import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import PostComment from "../../components/PostComments/index";
import Loading from "../../components/Ui/Loading";
import PostActions from "../../components/PostActions";
import "./Article.scss";
import PostHeader from "../../components/PostHeader";

import { getPostById } from "../../api/posts.api";

const Article = () => {
    const {id} = useParams()
    let [searchParams] = useSearchParams();
    const [comment, setComment] = useState(searchParams.get('comment') || null)
    const location = useLocation()
    const navigate = useNavigate()

    const [isLoading, setIsLoading] = useState(false)
    const [article, setArticle] = useState([ ])

    useEffect(() => {
        const getArticle = async () => {
            try {
                setIsLoading(true)

                const result = await getPostById(id, {
                    expand: "author,category"
                })

                if (result.status) {
                    setArticle(result.data)
                } else {
                    navigate("/404")
                }
            } catch {
                navigate("/404")
            } finally {
                setIsLoading(false)
            }
        }

        getArticle()
    }, [id, navigate])

    useEffect(() => {
        if (location.state?.comment) {
            setComment(location.state.comment)
            return
        }

        const commentId = searchParams.get("comment")

        if (commentId) {
            setComment(commentId)
        }
    }, [location.state?.comment, searchParams])


    return (
        (!isLoading) ?
        <div>
            {
                article ?
                <div className="article">
                
                    <h1 className="article_title">{article.title}</h1>
                    <div className="article_topic">
                        <PostHeader post={article} onDeletePost={() => navigate('/posts')} />
                        <PostActions article={article} setArticle={setArticle} onDeletePost={() => navigate('/posts')} />
                    </div>
                    {article.featured_image ? 
                        <div className="article_featured_image">
                            <img src={article.featured_image} alt={"featured"}/> 
                        </div>
                    : 
                        <></>
                    }
                    <div className="article_content" dangerouslySetInnerHTML={{__html: article.content_text}}>
                    </div>
                    <PostComment postId={article._id} navigateTo={comment}/>
                </div>
                :
                <></>     
            }
            </div>
        :
        <Loading size={48}/> 
    )
}

export default Article;