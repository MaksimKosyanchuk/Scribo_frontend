import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { AppContext } from "../../App";

import "./Posts.scss";

import { getCategories } from "../../api/categories";

import PostActions from "../PostActions";
import PostHeader from "../PostHeader";
import PostsFilters from "../../components/PostsFilters";
import Loading from "../Ui/Loading";
import NoPosts from "../NoPosts";


const Posts =  ( { posts, setPosts, isLoading, posts_filters = [] } ) => {
    const { profile } = useContext(AppContext)
    const [ filters, setFilters ] = useState([])
    const [ filteredPosts, setFilteredPosts ] = useState()
    const [ categories, setCategories ] = useState([])

    useEffect(() => {
        const isPostsFiltersEmpty = posts_filters.length === 0;

        let uniqueFilters = [
            ...new Set(posts.map(post => post.category).filter(Boolean))
        ].map(category => ({
            name: category,
            is_active: isPostsFiltersEmpty
                ? 
                    true
                : 
                    (posts_filters.includes("все") ? true : posts_filters.includes(category.toLowerCase())),
        }));

        if(profile){
            uniqueFilters.unshift({
                name: "По подписке",
                is_active: posts_filters.includes("по подписке")
            });
        }
        
        uniqueFilters.unshift({
            name: "Все",
            is_active: isPostsFiltersEmpty
                ? true
                : posts_filters.includes("все")
        });
        setFilters(uniqueFilters);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [posts, posts_filters ]);

    useEffect(() => { 
        const subscriptionFilterActive = filters.find(f => f.name.toLowerCase() === "по подписке")?.is_active;

        let updated_posts = posts.filter(post =>
            filters.some(f => f.name?.toLowerCase() === post.category?.toLowerCase() && f?.is_active)
        );
        if (subscriptionFilterActive) {
            updated_posts = updated_posts.filter(post =>
                profile?.follows?.map(id => id?.toLowerCase())?.includes(post.author._id.toLowerCase())
            );
        }
        
        setFilteredPosts(updated_posts)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters])

    useEffect(() => {
        const fetchCategories = async () => {
            const result = await getCategories();

            if (result.status) {
                setCategories(result.data);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        
    }, [posts])

    if(!posts) {
        return <NoPosts/>
    }
    
    return (
        <div className="posts posts_columns" id="posts_column">
            { 
                isLoading ?
                    <div className="posts_loader">
                        <Loading size={50} />
                    </div>
                : 
                    posts.length === 0 ?
                        <NoPosts />
                    :
                    <>
                        <PostsFilters filters={filters} setFilters={setFilters} categories={categories} />

                        {filteredPosts.length === 0 ? (
                            <NoPosts />
                        ) : (
                        filteredPosts.map(post => (
                            <div key={post._id} className="posts_item app-transition">
                                <PostHeader post={post} categoryIcon={categories.find(cat => cat.name === post.category)?.icon} onDeletePost={() => setFilteredPosts(prev => prev.filter(p => p._id !== post._id))}/>                                    
                            <div className="posts_item_content">
                                <h2 className="posts_item_title">{post.title}</h2>
                            </div>
                            {post.featured_image && (
                                <div className="posts_item_img">
                                    <img src={post.featured_image} alt="" />
                                </div>
                            )}
                            <div className={"posts_item_bottom"}>
                                <PostActions
                                    article={post}
                                    setArticle={(updatedPost) => {
                                        setPosts(prev =>
                                            prev.map(p =>
                                                p._id === updatedPost._id ? updatedPost : p
                                            )
                                        );
                                    }}
                                categoryIcon={categories.find(cat => cat.name === post.category)?.icon}/>
                            </div>
                                <Link to={`/posts/${post._id}`} className="posts_item_link"></Link>
                            </div>
                        ))
                        )}
                    </>
            }
        </div>
    );
}

export default Posts;