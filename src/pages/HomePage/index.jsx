import { useMemo } from "react";
import { Link, useSearchParams  } from "react-router-dom";
import Banner from "../../components/Banner";
import Posts from "../../components/Posts/index.jsx";
import BannerImage from "../../assets/images/banner-img.png"
import "./HomePage.scss"

const HomePage = () => {   
    const [searchParams] = useSearchParams();

    const filtersFromUrl = useMemo(() => {
        return (
            searchParams
                .get("filter")
                ?.split(",")
                .map(f => f.toLowerCase()) || []
        );
    }, [searchParams]);

    return (
        <>
            <Banner 
                image={BannerImage}>

                <h1>Please, visit my github page and share this site to your friends</h1>
                <a href="https://github.com/MaksimKosyanchuk/news_site_frontend" target="_blank" rel={"noreferrer"}>GitHub</a>
                <Link to={`/users/Maks`}>My profile</Link>
            </Banner>
            <Posts postsFilters={filtersFromUrl} />
        </>
    )
}

export default HomePage
