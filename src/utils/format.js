const format_date = (date) => {
    date = new Date(date);

    const months = [
        "января", "февраля", "марта", "апреля", 
        "мая", "июня", "июля", "августа", 
        "сентября", "октября", "ноября", "декабря"
        ];

    const day = date.getDate().toString().padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year} года`
}

module.exports = {
    format_date
}