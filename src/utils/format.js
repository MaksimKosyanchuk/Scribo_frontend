function format_date_time(date) {
    date = new Date(date);

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${hours}:${minutes} - ${day}.${month}.${year}`;
}

const format_back = (date_time) => {
    if (!date_time) return "";

    const now = new Date();
    const past = new Date(date_time);
    const diffInMs = now - past;

    if (diffInMs < 0) return "только что";

    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    const pluralize = (number, titles) => {
        const cases = [2, 0, 1, 1, 1, 2];
        return titles[
            (number % 100 > 4 && number % 100 < 20) 
                ? 2 
                : cases[(number % 10 < 5) ? number % 10 : 5]
        ];
    };

    if (diffInSeconds < 60) {
        if (diffInSeconds <= 0) return "только что";
        return `${diffInSeconds} ${pluralize(diffInSeconds, ["секунду", "секунды", "секунд"])} назад`;
    }

    if (diffInMinutes < 60) {
        return `${diffInMinutes} ${pluralize(diffInMinutes, ["минуту", "минуты", "минут"])} назад`;
    }

    if (diffInHours < 24) {
        return `${diffInHours} ${pluralize(diffInHours, ["час", "часа", "часов"])} назад`;
    }

    if (diffInDays < 30) {
        return `${diffInDays} ${pluralize(diffInDays, ["день", "дня", "дней"])} назад`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
        return `${diffInMonths} ${pluralize(diffInMonths, ["месяц", "месяца", "месяцев"])} назад`;
    }

    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} ${pluralize(diffInYears, ["год", "года", "лет"])} назад`;
};

function getCategoryColorType(categoryName) {
    switch (categoryName?.toLowerCase()) {
        case "новости":
            return 1
        case "политика":
            return 2
        case "dev":
            return 3
        case "другое":
            return 4
        default:
            return 0
    }
}

module.exports = {
    format_date_time,
    format_back,
    getCategoryColorType
}