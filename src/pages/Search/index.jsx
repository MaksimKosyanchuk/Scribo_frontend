import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { searchSite } from "../../api/search.api";
import Category from "../../components/Category";
import UserBadge from "../../components/UserBadge";
import InputField from "../../components/Ui/InputField";
import { format_back } from "../../utils/format";
import { CATEGORY_COLORS } from "../../styles/constants";

import DefaultProfileAvatar from "../../assets/images/default-profile-avatar.png";
import Verified from "../../assets/svg/verified.svg?react";
import ChevronRightIcon from "../../assets/svg/chevron-right.svg?react";
import CrossIcon from "../../assets/svg/cross-icon.svg?react";

import "./Search.scss";

const emptyResults = { posts: [], users: [], categories: [] };

const GroupHead = ({ title, count }) => (
    <header className="search_page_group_head">
        <h2 className="kicker">{title}</h2>
        <span className="search_page_group_count">{count}</span>
    </header>
);

const SearchPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const urlQuery = searchParams.get("q") || "";
    const [value, setValue] = useState(urlQuery);
    const [results, setResults] = useState(emptyResults);
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef(null);
    const requestId = useRef(0);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        if (document.activeElement === inputRef.current) {
            return;
        }
        setValue(urlQuery);
    }, [urlQuery]);

    useEffect(() => {
        const trimmed = value.trim();
        const handle = window.setTimeout(() => {
            const next = trimmed ? { q: trimmed } : {};
            const current = searchParams.get("q") || "";
            if (current !== trimmed) {
                setSearchParams(next, { replace: true });
            }
        }, 200);

        return () => window.clearTimeout(handle);
    }, [value, searchParams, setSearchParams]);

    useEffect(() => {
        const trimmed = urlQuery.trim();
        if (trimmed.length < 2) {
            setResults(emptyResults);
            setIsLoading(false);
            return;
        }

        const id = ++requestId.current;
        setIsLoading(true);

        const handle = window.setTimeout(async () => {
            const response = await searchSite(trimmed);
            if (id !== requestId.current) {
                return;
            }
            setResults(response?.data || emptyResults);
            setIsLoading(false);
        }, 180);

        return () => window.clearTimeout(handle);
    }, [urlQuery]);

    const hasQuery = urlQuery.trim().length >= 2;
    const people = results.users || [];
    const categories = results.categories || [];
    const posts = results.posts || [];
    const total = people.length + categories.length + posts.length;

    return (
        <div className="search_page">
            <h1>Поиск</h1>
            <div className="search_page_field">
                <InputField
                    ref={inputRef}
                    type="search"
                    className={value ? "search_page_input" : ""}
                    value={value}
                    placeholder="Посты, люди, категории"
                    length={80}
                    onChange={(event) => setValue(event.target.value)}
                    aria-label="Поиск"
                />
                {value ? (
                    <button
                        type="button"
                        className="search_page_clear app-transition"
                        aria-label="Очистить"
                        onClick={() => {
                            setValue("");
                            setSearchParams({}, { replace: true });
                            inputRef.current?.focus();
                        }}
                    >
                        <CrossIcon />
                    </button>
                ) : null}
            </div>
            {!hasQuery ? (
                <p className="search_page_hint">Минимум две буквы — найдутся посты, люди и категории.</p>
            ) : isLoading ? (
                <p className="search_page_hint">Ищем…</p>
            ) : total === 0 ? (
                <p className="search_page_hint">Ничего не нашлось.</p>
            ) : (
                <div className="search_page_groups">
                    {people.length ? (
                        <section className="search_page_group">
                            <GroupHead title="Люди" count={people.length} />
                            <ul className="search_page_people">
                                {people.map((user) => (
                                    <li key={user._id}>
                                        <Link
                                            className="search_page_person section app-transition"
                                            to={`/users/${user.nick_name}`}
                                        >
                                            <img
                                                className="search_page_person_avatar"
                                                src={user.avatar || DefaultProfileAvatar}
                                                alt=""
                                            />
                                            <span className="search_page_person_copy">
                                                <span className="search_page_person_name">
                                                    {user.nick_name}
                                                    {user.is_verified ? (
                                                        <Verified className="search_page_person_verified verified-icon" />
                                                    ) : null}
                                                </span>
                                                {user.description ? (
                                                    <span className="search_page_person_bio">{user.description}</span>
                                                ) : (
                                                    <span className="search_page_person_bio">Профиль на сайте</span>
                                                )}
                                            </span>
                                            <ChevronRightIcon className="search_page_chevron" aria-hidden="true" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ) : null}

                    {categories.length ? (
                        <section className="search_page_group">
                            <GroupHead title="Категории" count={categories.length} />
                            <ul className="search_page_cats">
                                {categories.map((category) => (
                                    <li key={category._id}>
                                        <Link
                                            className="search_page_cat app-transition"
                                            to={`/posts?filter=${category._id}`}
                                        >
                                            <span className={`search_page_cat_mark ${CATEGORY_COLORS[category.color]?.className ?? ""}`}>
                                                <span className="search_page_cat_dot" aria-hidden="true" />
                                                {category.name}
                                            </span>
                                            <span className="search_page_cat_hint">В ленте</span>
                                            <ChevronRightIcon className="search_page_chevron" aria-hidden="true" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ) : null}

                    {posts.length ? (
                        <section className="search_page_group">
                            <GroupHead title="Посты" count={posts.length} />
                            <ul className="search_page_posts">
                                {posts.map((post) => (
                                    <li key={post._id} className="search_page_post">
                                        <div className="search_page_post_meta">
                                            <UserBadge data={post.author} />
                                            {post.created_date ? (
                                                <p className="search_page_post_date">{format_back(post.created_date)}</p>
                                            ) : null}
                                            {post.category ? <Category tag category={post.category} /> : null}
                                        </div>
                                        <Link className="search_page_post_body" to={`/posts/${post._id}`}>
                                            <span className="search_page_post_copy">
                                                <span className="search_page_post_title">{post.title}</span>
                                                {post.snippet ? (
                                                    <span className="search_page_post_snippet">{post.snippet}</span>
                                                ) : null}
                                            </span>
                                            {post.featured_image ? (
                                                <img
                                                    className="search_page_post_thumb"
                                                    src={post.featured_image}
                                                    alt=""
                                                />
                                            ) : null}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ) : null}
                </div>
            )}
        </div>
    );
};

export default SearchPage;
