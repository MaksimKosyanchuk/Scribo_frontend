import "./PostsFilters.scss";
import React from "react";
import Category from "../Category";


const PostsFilters = ({ filters, setFilters, categories }) => {
    const handle_click = (categoryName) => {
        setFilters(prev => {
            let updated = prev.map(f => {
            if (categoryName === "Все") {
                const isAllActive = prev.find(f => f.name === "Все")?.is_active;

                if (f.name !== "Все" && f.name !== "По подписке") {
                return { ...f, is_active: !isAllActive };
                }

                if (f.name === "Все") {
                return { ...f, is_active: !isAllActive };
                }

                return f;
            }

            if (f.name === categoryName) {
                return { ...f, is_active: !f.is_active };
            }

            if (f.name === "Все") {
                return { ...f, is_active: false };
            }

            return f;
            });

            const allExceptAllAndSubActive = updated
            .filter(f => f.name !== "Все" && f.name !== "По подписке")
            .every(f => f.is_active);

            if (allExceptAllAndSubActive) {
            updated = updated.map(f =>
                f.name === "Все" ? { ...f, is_active: true } : f
            );
            }

            return updated;
        });
    };

    return (
        <div className="posts_filters">
            {filters.map((category, index) => {
                if (!category) return null;

                return (
                    <React.Fragment key={category.name}>
                    <Category
                        is_active={category.is_active}
                        onClick={() => handle_click(category.name)}
                        name={category.name}
                        icon={categories.find(c => c.name === category.name)?.icon}
                    >
                    </Category>
                    {index === 0 && (
                        <div className="post_filter post_filter_separator app-transition"></div>
                    )}
                    </React.Fragment>
                );
                })
            }
        </div>
    );
}

export default PostsFilters;