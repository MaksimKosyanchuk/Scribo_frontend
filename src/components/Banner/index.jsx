import { Link } from 'react-router-dom';

import Logo from "../../assets/svg/full-logo-text-icon.svg?react";
import bannerImage from "../../assets/images/banner-img.png";

import ChipButton from "../Ui/ChipButton";

import "./Banner.scss";

const Banner = () => {
    
    const openPersonalGithub = () => {
        window.open("https://github.com/MaksimKosyanchuk", "_blank");
    }
    
    return (
        <div className="banner">
            <div className="banner_content">
                <div className="banner_content_title">
                    <h1>
                        Hello! It's{" "}
                    </h1>
                    <Logo className="banner_content_title_logo app-transition"/>
                </div>

                <p className="banner_content_text">
                    This is my personal project, developed voluntarily in my free time.
    I’d really appreciate it if you checked out the links below.
                </p>

                <div className="banner_content_actions">
                    <ChipButton isActive={true} onClick={openPersonalGithub}>
                        My GitHub
                    </ChipButton>
                    <ChipButton isActive={true}>
                        <Link to={"/users/Maks"}>
                            My profile
                        </Link>
                    </ChipButton>
                </div>
            </div>

            <img
                src={bannerImage}
                alt=""
                className="banner_image"
            />
        </div>
    );
};

export default Banner;
