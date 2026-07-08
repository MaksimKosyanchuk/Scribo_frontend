import "./PostsFilters.scss";
import React from "react";
import Category from "../Category";

const PostsFilters = ({ filters, setFilters }) => {

    const handleClick = (categoryId) => {
        setFilters(prev => {
            // Кнопка "Все"
            if (categoryId === "all") {
                const isAllActive = prev.find(f => f._id === "all")?.is_active;

                return prev.map(filter => {
                    if (filter._id === "subscription") {
                        return filter;
                    }

                    if (filter._id === "all") {
                        return {
                            ...filter,
                            is_active: !isAllActive
                        };
                    }

                    return {
                        ...filter,
                        is_active: !isAllActive
                    };
                });
            }

            // Кнопка "По подписке"
            if (categoryId === "subscription") {
                return prev.map(filter =>
                    filter._id === "subscription"
                        ? {
                            ...filter,
                            is_active: !filter.is_active
                        }
                        : filter
                );
            }

            // Обычная категория
            let updated = prev.map(filter => {
                if (filter._id === categoryId) {
                    return {
                        ...filter,
                        is_active: !filter.is_active
                    };
                }

                if (filter._id === "all") {
                    return {
                        ...filter,
                        is_active: false
                    };
                }

                return filter;
            });

            // Если все категории активны — автоматически активируем "Все"
            const allCategoriesActive = updated
                .filter(f => !["all", "subscription"].includes(f._id))
                .every(f => f.is_active);

            updated = updated.map(filter =>
                filter._id === "all"
                    ? {
                        ...filter,
                        is_active: allCategoriesActive
                    }
                    : filter
            );

            return updated;
        });
    };

    return (
        <div className="posts_filters">
            {filters.map((category, index) => (
                <React.Fragment key={category._id ?? category.name}>
                    <Category
                        is_active={category.is_active}
                        onClick={() => handleClick(category._id)}
                        category={category}
                    />

                    {index === 0 && (
                        <div className="post_filter post_filter_separator app-transition" />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

export default PostsFilters;