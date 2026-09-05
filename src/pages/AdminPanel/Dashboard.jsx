import { useContext, useEffect, useMemo, useState } from "react";

import { AppContext } from "../../App";
import { getDashboard } from "../../api/analytics.api";

import ChipButton from "../../components/Ui/ChipButton";
import Loading from "../../components/Ui/Loading";

import "./Dashboard.scss";

const RANGES = [7, 14, 30];

const ACTIVITY_LABELS = {
    create_post: "Посты",
    update_post: "Правки постов",
    delete_post: "Удаления постов",
    register: "Регистрации",
    create_category: "Категории",
    update_category: "Правки категорий",
    delete_category: "Удаления категорий",
    update_role: "Смена ролей",
    create_support_request: "Обращения",
    reply_support_request: "Ответы",
    update_support_status: "Статусы обращений",
    like_post: "Лайки",
    comment_post: "Комментарии",
    reply_comment: "Ответы на комментарии"
};

const TREND_KEYS = [
    { key: "visits", label: "Посещения", color: "var(--text-color)" }
];

const locationLabel = (item) => {
    const city = String(item.city || "").trim()
    const country = String(item.country || "").trim()

    if (city && country && city !== country && city !== "Локально" && city !== "Неизвестно") {
        return `${city}, ${country}`
    }

    if (city && city !== "Локально" && city !== "Неизвестно") {
        return city
    }

    return country || city
};

const formatDay = (iso) => {
    const date = new Date(`${iso}T00:00:00Z`)

    return date.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "short"
    })
};

const formatNumber = (value) => {
    return new Intl.NumberFormat("ru-RU").format(value || 0);
};

const deltaLabel = (current, previous) => {
    if (!previous && !current) {
        return null;
    }

    if (!previous) {
        return { text: "новые данные", tone: "up" };
    }

    const diff = Math.round(((current - previous) / previous) * 100);

    if (diff === 0) {
        return { text: "без изменений", tone: "flat" };
    }

    return {
        text: `${diff > 0 ? "+" : ""}${diff}%`,
        tone: diff > 0 ? "up" : "down"
    };
};

const TrendChart = ({ series, keys }) => {
    const [hover, setHover] = useState(null);
    const width = 640;
    const height = 220;
    const pad = { top: 28, right: 12, bottom: 28, left: 8 };
    const innerWidth = width - pad.left - pad.right;
    const innerHeight = height - pad.top - pad.bottom;

    const maxValue = Math.max(
        1,
        ...series.flatMap((point) => keys.map((item) => Number(point[item.key] || 0)))
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
            .join(" ")
    }));

    const ticks = series.filter((_, index) => {
        if (series.length <= 8) {
            return true;
        }

        return index === 0 || index === series.length - 1 || index % Math.ceil(series.length / 6) === 0;
    });

    const hitWidth = series.length ? innerWidth / series.length : innerWidth;
    const active = hover != null ? series[hover] : null;
    const activeValue = active ? Number(active[keys[0]?.key] || 0) : 0;
    const hint = active ? `${formatDay(active.date)} · ${formatNumber(activeValue)}` : "";
    const hintWidth = Math.min(180, Math.max(88, hint.length * 6.2));
    const hintX = active
        ? Math.min(Math.max(toX(hover) - hintWidth / 2, pad.left), width - pad.right - hintWidth)
        : 0;

    return (
        <svg className="analytics_chart" viewBox={`0 0 ${width} ${height}`} role="img">
            <line
                className="analytics_chart_axis"
                x1={pad.left}
                y1={pad.top + innerHeight}
                x2={pad.left + innerWidth}
                y2={pad.top + innerHeight}
            />
            {polylines.map((line) => (
                <polyline
                    key={line.key}
                    className="analytics_chart_line"
                    points={line.points}
                    stroke={line.color}
                    fill="none"
                />
            ))}
            {series.map((point, index) => (
                <circle
                    key={`dot-${point.date}`}
                    className="analytics_chart_dot"
                    cx={toX(index)}
                    cy={toY(Number(point[keys[0]?.key] || 0))}
                    r={hover === index ? 4 : 2.5}
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
                    <rect
                        x={hintX}
                        y={4}
                        width={hintWidth}
                        height={20}
                        rx={6}
                    />
                    <text
                        x={hintX + hintWidth / 2}
                        y={18}
                        textAnchor="middle"
                    >
                        {hint}
                    </text>
                </g>
            ) : null}
            {series.map((point, index) => (
                <rect
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
                const label = point.date.slice(5).replace("-", ".");

                return (
                    <text
                        key={point.date}
                        className="analytics_chart_tick"
                        x={toX(index)}
                        y={height - 6}
                        textAnchor="middle"
                    >
                        {label}
                    </text>
                );
            })}
        </svg>
    );
};

const BarChart = ({ items, empty, wideLabel }) => {
    const maxValue = Math.max(1, ...items.map((item) => item.count));

    if (!items.length) {
        return <p className="analytics_empty">{empty || "Пока нет событий за период"}</p>;
    }

    return (
        <div className={`analytics_bars${wideLabel ? " analytics_bars_wide" : ""}`}>
            {items.map((item) => (
                <div className="analytics_bars_row" key={item.type}>
                    <p className="analytics_bars_label">{ACTIVITY_LABELS[item.type] || item.type}</p>
                    <div className="analytics_bars_track">
                        <div
                            className="analytics_bars_fill app-transition"
                            style={{ width: `${Math.max(6, (item.count / maxValue) * 100)}%` }}
                        />
                    </div>
                    <p className="analytics_bars_value">{formatNumber(item.count)}</p>
                </div>
            ))}
        </div>
    );
};

const StatCard = ({ label, value, previous }) => {
    const delta = previous == null ? null : deltaLabel(value, previous);

    return (
        <div className="analytics_stat app-transition">
            <p className="analytics_stat_label">{label}</p>
            <p className="analytics_stat_value">{formatNumber(value)}</p>
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
        visits_prev: data?.totals?.visits_prev ?? data?.totals?.pageviews_prev
    };
    const series = (data?.series || []).map((point) => ({
        ...point,
        visits: point.visits ?? point.pageviews
    }));
    const activity = useMemo(() => (data?.activity || []).slice(0, 8), [data]);
    const cities = useMemo(
        () => (data?.cities || [])
            .map((item) => ({
                type: locationLabel(item),
                count: item.visits ?? item.entries ?? 0
            }))
            .filter((item) => item.type && item.count > 0),
        [data]
    );

    return (
        <div className="analytics">
            <div className="analytics_toolbar">
                <p className="analytics_toolbar_hint">Посещения, уникальные гости и активность за выбранный период</p>
                <div className="analytics_toolbar_ranges">
                    {RANGES.map((range) => (
                        <ChipButton
                            key={range}
                            isActive={days === range}
                            onClick={() => setDays(range)}
                        >
                            {range} дней
                        </ChipButton>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <Loading size={40} />
            ) : (
                <>
                    <div className="analytics_stats">
                        <StatCard label="Посещения" value={totals.visits} previous={totals.visits_prev} />
                        <StatCard label="Уникальные посетители" value={totals.unique_visitors} previous={totals.unique_visitors_prev} />
                        <StatCard
                            label="Авторизованные"
                            value={totals.authorized_visits ?? totals.unique_users}
                            previous={totals.authorized_visits_prev}
                        />
                        <StatCard label="Новые пользователи" value={totals.new_users} />
                        <StatCard label="Новые посты" value={totals.new_posts} />
                        <StatCard label="Комментарии" value={totals.new_comments} />
                        <StatCard label="События" value={totals.activity_events} />
                        <StatCard label="Всего пользователей" value={totals.registered_users} />
                    </div>

                    <div className="analytics_grid">
                        <section className="analytics_block">
                            <div className="analytics_block_head">
                                <h2>Посещения</h2>
                            </div>
                            {series.length ? (
                                <TrendChart series={series} keys={TREND_KEYS} />
                            ) : (
                                <p className="analytics_empty">Пока нет посещений</p>
                            )}
                        </section>

                        <section className="analytics_block">
                            <div className="analytics_block_head">
                                <h2>Города</h2>
                            </div>
                            <BarChart
                                items={cities}
                                wideLabel
                                empty="Города появятся после первых посещений"
                            />
                        </section>
                    </div>

                    <div className="analytics_grid analytics_grid_bottom">
                        <section className="analytics_block">
                            <div className="analytics_block_head">
                                <h2>Популярные страницы</h2>
                            </div>
                            {data?.top_paths?.length ? (
                                <div className="analytics_table">
                                    {data.top_paths.map((item) => (
                                        <div className="analytics_table_row" key={item.path}>
                                            <p className="analytics_table_path">{item.path}</p>
                                            <p>{formatNumber(item.visits)} визитов</p>
                                            <p className="analytics_table_muted">{formatNumber(item.unique_visitors)} уник.</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="analytics_empty">Страницы появятся после первых визитов</p>
                            )}
                        </section>

                        <section className="analytics_block">
                            <div className="analytics_block_head">
                                <h2>Активность</h2>
                            </div>
                            <BarChart items={activity} />
                        </section>
                    </div>

                    <div className="analytics_grid analytics_grid_bottom">
                        <section className="analytics_block">
                            <div className="analytics_block_head">
                                <h2>Контент</h2>
                            </div>
                            <div className="analytics_content_stats">
                                <div>
                                    <p className="analytics_stat_label">Посты</p>
                                    <p className="analytics_stat_value">{formatNumber(totals.posts)}</p>
                                </div>
                                <div>
                                    <p className="analytics_stat_label">Комментарии</p>
                                    <p className="analytics_stat_value">{formatNumber(totals.comments)}</p>
                                </div>
                                <div>
                                    <p className="analytics_stat_label">Лайки</p>
                                    <p className="analytics_stat_value">{formatNumber(totals.likes)}</p>
                                </div>
                            </div>
                        </section>
                    </div>
                </>
            )}
        </div>
    );
};

export default DashboardPage;
