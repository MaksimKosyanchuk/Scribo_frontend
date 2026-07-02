const scrollTo = (object) => {
    document.getElementById(object)?.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}

export { scrollTo };