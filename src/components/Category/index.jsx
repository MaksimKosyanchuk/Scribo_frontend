import { memo } from "react";
import ChipButton from "../Ui/ChipButton";
import "./Category.scss";
import { useNavigate } from "react-router-dom";

import CategoryIcon1 from "../../assets/svg/categories/1.svg?react";
import CategoryIcon2 from "../../assets/svg/categories/2.svg?react";
import CategoryIcon3 from "../../assets/svg/categories/3.svg?react";
import CategoryIcon4 from "../../assets/svg/categories/4.svg?react";
import CategoryIcon5 from "../../assets/svg/categories/5.svg?react";
import CategoryIcon6 from "../../assets/svg/categories/6.svg?react";
import CategoryIcon7 from "../../assets/svg/categories/7.svg?react";
import CategoryIcon8 from "../../assets/svg/categories/8.svg?react";
import CategoryIcon9 from "../../assets/svg/categories/9.svg?react";
import CategoryIcon10 from "../../assets/svg/categories/10.svg?react";
import CategoryIcon11 from "../../assets/svg/categories/11.svg?react";
import CategoryIcon12 from "../../assets/svg/categories/12.svg?react";
import CategoryIcon13 from "../../assets/svg/categories/13.svg?react";
import CategoryIcon14 from "../../assets/svg/categories/14.svg?react";
import CategoryIcon15 from "../../assets/svg/categories/15.svg?react";
import CategoryIcon16 from "../../assets/svg/categories/16.svg?react";
import CategoryIcon17 from "../../assets/svg/categories/17.svg?react";
import CategoryIcon18 from "../../assets/svg/categories/18.svg?react";
import CategoryIcon19 from "../../assets/svg/categories/19.svg?react";
import CategoryIcon20 from "../../assets/svg/categories/20.svg?react";
import CategoryIcon21 from "../../assets/svg/categories/21.svg?react";
import CategoryIcon22 from "../../assets/svg/categories/22.svg?react";
import CategoryIcon23 from "../../assets/svg/categories/23.svg?react";
import CategoryIcon24 from "../../assets/svg/categories/24.svg?react";
import CategoryIcon25 from "../../assets/svg/categories/25.svg?react";
import CategoryIcon26 from "../../assets/svg/categories/26.svg?react";

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