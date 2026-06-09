import { useState, useEffect } from "react";
import { API_URL } from "../../config";
import { useParams, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import PostComment from "../../components/PostComments/index";
import Loading from "../../components/Ui/Loading";
import { ArticleTopic } from "../../components/ArticleTopic";
import "./Article.scss";


const Article = () => {
    const {id} = useParams()
    let [searchParams] = useSearchParams();
    const [comment, setComment] = useState(searchParams.get('comment') || null)
    const location = useLocation()
    const navigate = useNavigate()
    
    const [isLoading, setIsLoading] = useState(false)
    const [article, setArticle] = useState([ ])

    useEffect(() => {
        getArticle()
        if(location.state?.comment) {
            setComment(location.state.comment)
        }
        // eslint-disable-next-line
    }, [location.state?.time])

    const getArticle = async () => {
        try {
            setIsLoading(true)
            
            await fetch(`${API_URL}/api/posts/${id}?expand=author,comments`)
            .then(res => res.json())
            .then(res => {
                if (res.status === true) {
                    setArticle(res.data)
                }
                else {
                    navigate('/404')
                }
            })
            .finally(() => {
                setIsLoading(false)
            })
            
        } catch(e) {
            navigate('/404')
        }
    }

    return (
        (!isLoading) ?
        <div>
            {
                article ?
                <div className="article">
                    <h1 className="article_title">{article.title}</h1>
                    <ArticleTopic article={article} onDeletePost={() => navigate('/posts')} />
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