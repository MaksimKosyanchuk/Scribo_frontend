import { Link } from "react-router-dom";

import "./Banner.scss";

const Banner = () => (
    <div className="banner">
        <p>
            Личный проект.{" "}
            <a
                href="https://github.com/MaksimKosyanchuk"
                target="_blank"
                rel="noreferrer"
            >
                GitHub
            </a>
            {" · "}
            <Link to="/users/Maks">Профиль</Link>
        </p>
    </div>
);

export default Banner;
