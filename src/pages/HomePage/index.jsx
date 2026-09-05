import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Banner from "../../components/Banner";
import Posts from "../../components/Posts/index.jsx";
import "./HomePage.scss";

const HomePage = () => {
    const [searchParams] = useSearchParams();

    const filtersFromUrl = useMemo(() => {
        return (
            searchParams
                .get("filter")
                ?.split(",")
                .map((f) => f.toLowerCase()) || []
        );
    }, [searchParams]);

    return (
        <>
            <Banner />
            <Posts postsFilters={filtersFromUrl} />
        </>
    );
};

export default HomePage;
