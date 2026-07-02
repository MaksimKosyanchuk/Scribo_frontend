const scrollTo = (object, block="center") => {
    document.getElementById(object)?.scrollIntoView({
        behavior: "smooth",
        block: block
    });
}

export { scrollTo };