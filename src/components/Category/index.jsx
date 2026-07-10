import { memo } from "react";
import ChipButton from "../Ui/ChipButton";
import "./Category.scss";
import { useNavigate } from "react-router-dom";

import { ReactComponent as CategoryIcon1 } from "../../assets/svg/categories/1.svg";
import { ReactComponent as CategoryIcon2 } from "../../assets/svg/categories/2.svg";
import { ReactComponent as CategoryIcon3 } from "../../assets/svg/categories/3.svg";
import { ReactComponent as CategoryIcon4 } from "../../assets/svg/categories/4.svg";
import { ReactComponent as CategoryIcon5 } from "../../assets/svg/categories/5.svg";
import { ReactComponent as CategoryIcon6 } from "../../assets/svg/categories/6.svg";
import { ReactComponent as CategoryIcon7 } from "../../assets/svg/categories/7.svg";
import { ReactComponent as CategoryIcon8 } from "../../assets/svg/categories/8.svg";
import { ReactComponent as CategoryIcon9 } from "../../assets/svg/categories/9.svg";
import { ReactComponent as CategoryIcon10 } from "../../assets/svg/categories/10.svg";
import { ReactComponent as CategoryIcon11 } from "../../assets/svg/categories/11.svg";
import { ReactComponent as CategoryIcon12 } from "../../assets/svg/categories/12.svg";
import { ReactComponent as CategoryIcon13 } from "../../assets/svg/categories/13.svg";
import { ReactComponent as CategoryIcon14 } from "../../assets/svg/categories/14.svg";
import { ReactComponent as CategoryIcon15 } from "../../assets/svg/categories/15.svg";
import { ReactComponent as CategoryIcon16 } from "../../assets/svg/categories/16.svg";
import { ReactComponent as CategoryIcon17 } from "../../assets/svg/categories/17.svg";
import { ReactComponent as CategoryIcon18 } from "../../assets/svg/categories/18.svg";
import { ReactComponent as CategoryIcon19 } from "../../assets/svg/categories/19.svg";
import { ReactComponent as CategoryIcon20 } from "../../assets/svg/categories/20.svg";
import { ReactComponent as CategoryIcon21 } from "../../assets/svg/categories/21.svg";
import { ReactComponent as CategoryIcon22 } from "../../assets/svg/categories/22.svg";
import { ReactComponent as CategoryIcon23 } from "../../assets/svg/categories/23.svg";
import { ReactComponent as CategoryIcon24 } from "../../assets/svg/categories/24.svg";
import { ReactComponent as CategoryIcon25 } from "../../assets/svg/categories/25.svg";
import { ReactComponent as CategoryIcon26 } from "../../assets/svg/categories/26.svg";

import { CATEGORY_COLORS } from "../../styles/constants";

const categoryIcons = {
    1: CategoryIcon1,
    2: CategoryIcon2,
    3: CategoryIcon3,
    4: CategoryIcon4,
    5: CategoryIcon5,
    6: CategoryIcon6,
    7: CategoryIcon7,
    8: CategoryIcon8,
    9: CategoryIcon9,
    10: CategoryIcon10,
    11: CategoryIcon11,
    12: CategoryIcon12,
    13: CategoryIcon13,
    14: CategoryIcon14,
    15: CategoryIcon15,
    16: CategoryIcon16,
    17: CategoryIcon17,
    18: CategoryIcon18,
    19: CategoryIcon19,
    20: CategoryIcon20,
    21: CategoryIcon21,
    22: CategoryIcon22,
    23: CategoryIcon23,
    24: CategoryIcon24,
    25: CategoryIcon25,
    26: CategoryIcon26,
};

const Category = memo(({ category, is_active, onClick, className }) => {
    const nagivate = useNavigate();

    const Icon = categoryIcons[category?.icon];

    return (
        <ChipButton
            is_active={is_active}
            onClick={
                onClick ??
                (() => {
                    nagivate("/posts?filter=" + category?._id);
                })
            }
            className={`category_content ${CATEGORY_COLORS[category?.color]?.className ?? ""} ${className || ""}`}
        >
            {Icon && <Icon className="category_svg_icon" />}
            <p>{category?.name}</p>
        </ChipButton>
    );
});

export default Category;