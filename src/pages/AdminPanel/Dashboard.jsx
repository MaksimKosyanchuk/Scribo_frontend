import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { AppContext } from "../../App";
import { getDashboard } from "../../api/analytics.api";
import { hashtagSearchPath } from "../../utils/hashtags";
import { format_date_time } from "../../utils/format";

import ChipButton from "../../components/Ui/ChipButton";
import Loading from "../../components/Ui/Loading";

import "./Dashboard.scss";

const RANGES = [7, 14, 30];

const ACTIVITY_LABELS = {
    create_post: "Публикации",
    update_post: "Изменения постов",
    delete_post: "Удаления постов",
    register: "Регистрации",
    create_category: "Новые категории",
    update_category: "Изменения категорий",
    delete_category: "Удаления категорий",
    update_role: "Смена ролей",
    create_support_request: "Обращения в поддержку",
    reply_support_request: "Ответы в тикетах",
    update_support_status: "Статусы тикетов",
    like_post: "Лайки",
    comment_post: "Комментарии",
    reply_comment: "Ответы на комментарии",
};

const TRAFFIC_KEYS = [
    { key: "visits", label: "Просмотры", color: "var(--text-color)" },
    { key: "visitors", label: "Посетители", color: "var(--hashtag-color)" },
];

const locationLabel = (item) => {
    const city = String(item.city || "").trim();
    const country = String(item.country || "").trim();

    if (city && country && city !== country && city !== "Локально" && city !== "Неизвестно") {
        return `${city}, ${country}`;
    }

    if (city && city !== "Локально" && city !== "Неизвестно") {
        return city;
    }

    return country || city;
};

const formatDay = (iso) => {
    const date = new Date(`${iso}T00:00:00Z`);
    return date.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "short",
    });
};

const formatRange = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days + 1);
    const options = { day: "numeric", month: "short" };
    return `${start.toLocaleDateString("ru-RU", options)} — ${end.toLocaleDateString("ru-RU", options)}`;
};

const formatNumber = (value) => new Intl.NumberFormat("ru-RU").format(value || 0);

const deltaLabel = (current, previous) => {
    if (previous == null) {
        return null;
    }

    const curr = Number(current || 0);
    const prev = Number(previous || 0);

    if (!prev && !curr) {
        return null;
    }

    if (!prev) {
        return { text: "Нет данных за прошлый период", tone: "flat" };
    }

    const abs = curr - prev;
    if (abs === 0) {
        return { text: "без изменений", tone: "flat" };
    }

    if (prev < 10) {
        return {
            text: `${abs > 0 ? "+" : ""}${formatNumber(abs)} к прошлому периоду`,
            tone: abs > 0 ? "up" : "down",
        };
    }

    const pct = Math.round((abs / prev) * 100);
    return {
        text: `${pct > 0 ? "+" : ""}${pct}% к прошлому периоду`,
        tone: pct > 0 ? "up" : "down",
    };
};

const TrendChart = ({ series, keys }) => {
    const [hover, setHover] = useState(null);
    const width = 720;
    const height = 248;
    const pad = { top: 16, right: 12, bottom: 32, left: 36 };
    const innerWidth = width - pad.left - pad.right;
    const innerHeight = height - pad.top - pad.bottom;

    const maxValue = Math.max(
        1,
        ...series.flatMap((point) => keys.map((item) => Number(point[item.key] || 0))),
    );

    const toX = (index) => {
        if (series.length <= 1) {
            return pad.left;
        }
        return pad.left + (index / (series.length - 1)) * innerWidth;
    };

    const toY = (value) => pad.top + innerHeight - (value / maxValue) * innerHeight;

    const polylines = keys.map((item) => ({
        ...item,
        points: series
            .map((point, index) => `${toX(index)},${toY(Number(point[item.key] || 0))}`)
            .join(" "),
    }));

    const areaPath = (() => {
        if (!series.length) {
            return "";
        }
        const first = polylines[0];
        const start = `${toX(0)},${toY(0)}`;
        const end = `${toX(series.length - 1)},${toY(0)}`;
        return `M ${start} L ${first.points} L ${end} Z`;
    })();

    const ticks = series.filter((_, index) => {
        if (series.length <= 8) {
            return true;
        }
        return index === 0 || index === series.length - 1 || index % Math.ceil(series.length / 6) === 0;
    });

    const yTicks = [0, 0.5, 1].map((ratio) => Math.round(maxValue * ratio));
    const hitWidth = series.length ? innerWidth / series.length : innerWidth;
    const active = hover != null ? series[hover] : null;

    return (
        <div className="analytics_chart_wrap">
            <svg className="analytics_chart" viewBox={`0 0 ${width} ${height}`} role="img">
                {yTicks.map((value) => (
                    <g key={value}>
                        <line
                            className="analytics_chart_grid"
                            x1={pad.left}
                            y1={toY(value)}
                            x2={pad.left + innerWidth}
                            y2={toY(value)}
                        />
                        <text className="analytics_chart_ytick" x={pad.left - 8} y={toY(value) + 3} textAnchor="end">
                            {formatNumber(value)}
                        </text>
                    </g>
                ))}
                {areaPath ? (
                    <path className="analytics_chart_area" d={areaPath} fill={keys[0]?.color} />
                ) : null}
                {polylines.map((line) => (
                    <polyline
                        key={line.key}
                        className="analytics_chart_line"
                        points={line.points}
                        stroke={line.color}
                        fill="none"
                    />
                ))}
                {active ? (
                    <g className="analytics_chart_hint">
                        <line
                            className="analytics_chart_guide"
                            x1={toX(hover)}
                            y1={pad.top}
                            x2={toX(hover)}
                            y2={pad.top + innerHeight}
                        />
                        {keys.map((item) => (
                            <circle
                                key={item.key}
                                className="analytics_chart_dot"
                                cx={toX(hover)}
                                cy={toY(Number(active[item.key] || 0))}
                                r={4}
                                fill={item.color}
                            />
                        ))}
                    </g>
                ) : null}
                {series.map((point, index) => (
                    <rect
                        className="app-transition"
                        key={`hit-${point.date}`}
                        x={toX(index) - hitWidth / 2}
                        y={pad.top}
                        width={hitWidth}
                        height={innerHeight}
                        fill="transparent"
                        onMouseEnter={() => setHover(index)}
                        onMouseLeave={() => setHover(null)}
                    />
                ))}
                {ticks.map((point) => {
                    const index = series.indexOf(point);
                    return (
                        <text
                            key={point.date}
                            className="analytics_chart_tick"
                            x={toX(index)}
                            y={height - 8}
                            textAnchor="middle"
                        >
                            {formatDay(point.date)}
                        </text>
                    );
                })}
            </svg>
            {active ? (
                <div className="analytics_chart_tooltip">
                    <p>{formatDay(active.date)}</p>
                    {keys.map((item) => (
                        <p key={item.key}>
                            {item.label}: {formatNumber(active[item.key])}
                        </p>
                    ))}
                </div>
            ) : null}
            <div className="analytics_legend">
                {keys.map((item) => (
                    <span className="analytics_legend_item" key={item.key}>
                        <span className="analytics_legend_swatch" style={{ background: item.color }} />
                        {item.label}
                    </span>
                ))}
            </div>
        </div>
    );
};

const BarChart = ({ items, empty, wideLabel }) => {
    const maxValue = Math.max(1, ...items.map((item) => item.count));

    if (!items.length) {
        return <p className="analytics_empty">{empty || "Нет данных за период"}</p>;
    }

    return (
        <div className={`analytics_bars${wideLabel ? " analytics_bars_wide" : ""}`}>
            {items.map((item) => {
                const label = ACTIVITY_LABELS[item.type] || item.type;
                return (
                    <div className="analytics_bars_row" key={item.key || item.type}>
                        {item.href ? (
                            <Link
                                className={`analytics_bars_label${item.hashtag ? " hashtag" : ""}`}
                                to={item.href}
                                title={label}
                            >
                                {label}
                            </Link>
                        ) : (
                            <p className="analytics_bars_label" title={label}>{label}</p>
                        )}
                        <div className="analytics_bars_track">
                            <div
                                className="analytics_bars_fill app-transition"
                                style={{ width: `${Math.max(6, (item.count / maxValue) * 100)}%` }}
                            />
                        </div>
                        <p className="analytics_bars_value">
                            {formatNumber(item.count)}
                            {item.note ? <span> · {item.note}</span> : null}
                        </p>
                    </div>
                );
            })}
        </div>
    );
};

const AnalyticsGroup = ({ title, className, children }) => (
    <section className={`analytics_group ${className || ""}`.trim()}>
        <h2 className="kicker">{title}</h2>
        {children}
    </section>
);

const StatCard = ({ label, value, previous, hint }) => {
    const delta = previous == null ? null : deltaLabel(value, previous);

    return (
        <div className="analytics_stat app-transition">
            <p className="analytics_stat_label">{label}</p>
            <p className="analytics_stat_value">{formatNumber(value)}</p>
            {hint ? <p className="analytics_stat_hint">{hint}</p> : null}
            {delta ? (
                <p className={`analytics_stat_delta analytics_stat_delta_${delta.tone}`}>{delta.text}</p>
            ) : null}
        </div>
    );
};

const DashboardPage = () => {
    const { showToast } = useContext(AppContext);
    const [days, setDays] = useState(14);
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setIsLoading(true);
            const result = await getDashboard(days);

            if (cancelled) {
                return;
            }

            if (!result?.status) {
                showToast({ type: "error", message: result?.message || "Не удалось загрузить аналитику" });
                setData(null);
                setIsLoading(false);
                return;
            }

            setData(result.data);
            setIsLoading(false);
        };

        load();

        return () => {
            cancelled = true;
        };
    }, [days, showToast]);

    const totals = {
        ...(data?.totals || {}),
        visits: data?.totals?.visits ?? data?.totals?.pageviews,
        visits_prev: data?.totals?.visits_prev ?? data?.totals?.pageviews_prev,
        visitors: data?.totals?.unique_visitors,
        visitors_prev: data?.totals?.unique_visitors_prev,
        auth_users: data?.totals?.unique_users ?? data?.totals?.authorized_visits,
        auth_users_prev: data?.totals?.unique_users_prev ?? data?.totals?.authorized_visits_prev,
    };
    const series = (data?.series || []).map((point) => ({
        ...point,
        visits: point.visits ?? point.pageviews,
        visitors: point.visitors ?? point.unique_visitors,
    }));
    const activity = useMemo(() => (data?.activity || []).slice(0, 8), [data]);
    const periodLikes = useMemo(
        () => (data?.activity || []).find((item) => item.type === "like_post")?.count || 0,
        [data],
    );
    const cities = useMemo(
        () =>
            (data?.cities || [])
                .map((item) => ({
                    type: locationLabel(item),
                    count: item.visits ?? item.entries ?? 0,
                }))
                .filter((item) => item.type && item.count > 0),
        [data],
    );
    const devices = useMemo(
        () =>
            (data?.devices || []).map((item) => ({
                type: item.kind,
                count: item.visits || 0,
            })),
        [data],
    );
    const categories = useMemo(
        () =>
            (data?.categories || []).map((item) => ({
                type: item.name,
                count: item.posts || 0,
            })),
        [data],
    );
    const searchWithHits = Math.max(0, Number(totals.searches || 0) - Number(totals.empty_searches || 0));

    return (
        <div className="analytics">
            <div className="analytics_toolbar">
                <div className="analytics_toolbar_ranges">
                    {RANGES.map((range) => (
                        <ChipButton
                            key={range}
                            variant="quiet"
                            isActive={days === range}
                            onClick={() => setDays(range)}
                        >
                            {range} дней
                        </ChipButton>
                    ))}
                </div>
                <p className="analytics_toolbar_hint">{formatRange(days)}</p>
            </div>

            {isLoading ? (
                <Loading size={40} />
            ) : (
                <>
                    <AnalyticsGroup title="Обзор">
                        <div className="analytics_stats">
                            <StatCard label="Просмотры" value={totals.visits} previous={totals.visits_prev} />
                            <StatCard
                                label="Уникальные посетители"
                                value={totals.visitors}
                                previous={totals.visitors_prev}
                            />
                            <StatCard
                                label="Авторизованные пользователи"
                                value={totals.auth_users}
                                previous={totals.auth_users_prev}
                            />
                            <StatCard label="Новые пользователи" value={totals.new_users} />
                        </div>
                    </AnalyticsGroup>

                    <AnalyticsGroup title="Трафик">
                        <section className="analytics_block app-transition">
                            {series.length ? (
                                <TrendChart series={series} keys={TRAFFIC_KEYS} />
                            ) : (
                                <p className="analytics_empty">Нет просмотров за период</p>
                            )}
                        </section>
                    </AnalyticsGroup>

                    <div className="analytics_grid">
                        <AnalyticsGroup title="Источники трафика">
                            <section className="analytics_block app-transition">
                                <h3 className="analytics_block_title">География</h3>
                                <BarChart
                                    items={cities}
                                    wideLabel
                                    empty="География появится после первых визитов"
                                />
                            </section>
                        </AnalyticsGroup>

                        <AnalyticsGroup title="Устройства">
                            <section className="analytics_block app-transition">
                                <BarChart items={devices} wideLabel empty="Нет данных по устройствам" />
                            </section>
                        </AnalyticsGroup>
                    </div>

                    <div className="analytics_grid">
                        <AnalyticsGroup title="Популярные страницы">
                            <section className="analytics_block app-transition">
                                <BarChart
                                    wideLabel
                                    empty="Нет просмотров страниц за период"
                                    items={(data?.top_paths || []).map((item) => ({
                                        type: item.path,
                                        count: item.visits || 0,
                                        note: `${formatNumber(item.unique_visitors)} чел.`,
                                    }))}
                                />
                            </section>
                        </AnalyticsGroup>

                        <AnalyticsGroup title="Топ постов">
                            <section className="analytics_block app-transition">
                                <BarChart
                                    wideLabel
                                    empty="Пока нет просмотров постов"
                                    items={(data?.top_posts || [])
                                        .filter((item) => Number(item.views_count) > 0)
                                        .map((item) => ({
                                            key: String(item._id),
                                            type: item.title,
                                            count: item.views_count || 0,
                                            href: `/posts/${item._id}`,
                                        }))}
                                />
                            </section>
                        </AnalyticsGroup>
                    </div>

                    <AnalyticsGroup title="Поиск">
                        <div className="analytics_stats">
                            <StatCard
                                label="Поисковые запросы"
                                value={totals.searches}
                                previous={totals.searches_prev}
                                hint={
                                    totals.hashtag_searches
                                        ? `${formatNumber(totals.hashtag_searches)} по тегам`
                                        : null
                                }
                            />
                            <StatCard label="Уникальные запросы" value={totals.unique_search_queries} />
                            <StatCard label="С результатами" value={searchWithHits} />
                            <StatCard
                                label="Без результатов"
                                value={totals.empty_searches}
                                previous={totals.empty_searches_prev}
                            />
                        </div>
                        <section className="analytics_block app-transition">
                            <h3 className="analytics_block_title">Популярные запросы</h3>
                            <BarChart
                                wideLabel
                                empty="Пока нет поисковых запросов"
                                items={(data?.top_queries || []).map((item) => ({
                                    type: item.query,
                                    count: item.count,
                                    note: item.empty ? "пусто" : "есть",
                                }))}
                            />
                        </section>
                    </AnalyticsGroup>

                    <AnalyticsGroup title="Контент">
                        <div className="analytics_stats">
                            <StatCard label="Посты" value={totals.posts} />
                            <StatCard label="Комментарии" value={totals.comments} />
                            <StatCard label="Лайки" value={totals.likes} />
                            <StatCard label="Категории" value={totals.categories} />
                            <StatCard
                                label="Посты с тегами"
                                value={totals.posts_with_hashtags}
                                hint={
                                    totals.unique_hashtags
                                        ? `${formatNumber(totals.unique_hashtags)} тегов`
                                        : null
                                }
                            />
                            <StatCard label="Аккаунты" value={totals.registered_users} />
                        </div>
                        <h3 className="analytics_block_title">Активность за период</h3>
                        <div className="analytics_stats">
                            <StatCard label="Опубликовано постов" value={totals.new_posts} />
                            <StatCard label="Написано комментариев" value={totals.new_comments} />
                            <StatCard label="Получено лайков" value={periodLikes} />
                        </div>
                        <div className="analytics_grid">
                            <section className="analytics_block app-transition">
                                <h3 className="analytics_block_title">Посты по категориям</h3>
                                <BarChart
                                    items={categories}
                                    wideLabel
                                    empty="Пока нет постов в категориях"
                                />
                            </section>
                            <section className="analytics_block app-transition">
                                <h3 className="analytics_block_title">Популярные теги</h3>
                                <BarChart
                                    wideLabel
                                    empty="В контенте пока нет тегов"
                                    items={(data?.top_hashtags || []).map((item) => ({
                                        type: item.tag,
                                        count: item.posts || 0,
                                        href: hashtagSearchPath(item.tag),
                                        hashtag: true,
                                        note: item.comments ? `${formatNumber(item.comments)} комм.` : null,
                                    }))}
                                />
                            </section>
                        </div>
                    </AnalyticsGroup>

                    <AnalyticsGroup title="Последняя активность">
                        <section className="analytics_block app-transition">
                            {(data?.recent_users || []).length ? (
                                <div className="analytics_table">
                                    {(data.recent_users || []).map((item) => (
                                        <Link
                                            key={String(item._id)}
                                            className="analytics_table_row"
                                            to={`/users/${item.nick_name}`}
                                        >
                                            <span className="analytics_table_path">{item.nick_name}</span>
                                            <span className="analytics_table_muted">
                                                {format_date_time(item.last_activity_at)}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="analytics_empty">Пока нет пользователей</p>
                            )}
                        </section>
                    </AnalyticsGroup>

                    <AnalyticsGroup title="Активность" className="analytics_group_compact">
                        <section className="analytics_block app-transition">
                            <BarChart items={activity} />
                        </section>
                    </AnalyticsGroup>
                </>
            )}
        </div>
    );
};

export default DashboardPage;
