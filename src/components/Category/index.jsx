import { memo } from "react";
import ChipButton from "../Ui/ChipButton";
import { getCategoryColorType } from "../../utils/format";
import "./Category.scss";
import { Link, useNavigate } from "react-router-dom";

import { ReactComponent as Icon1 } from "../../assets/svg/categories/1.svg";
import { ReactComponent as Icon2 } from "../../assets/svg/categories/2.svg";
import { ReactComponent as Icon3 } from "../../assets/svg/categories/3.svg";
import { ReactComponent as Icon4 } from "../../assets/svg/categories/4.svg";

const Category = memo(({ category, is_active, onClick, className }) => {
    const nagivate = useNavigate();

    const getCategoryIcon = (icon_id) => {
        switch(icon_id) {
            case 1:
                return ( <Icon1 className="category_svg_icon"/> )
            case 2:
                return ( <Icon2 className="category_svg_icon"/> )
            case 3:
                return ( <Icon3 className="category_svg_icon"/> )
            case 4:
                return ( <Icon4 className="category_svg_icon"/> )
            default:
                return(<></>)
        }
    }

    return (
        <ChipButton 
            is_active={is_active} 
            onClick={ onClick ??  (() => { nagivate('/posts?filter=' + category?.name) } )  } 
            className={`category_content category_type_${getCategoryColorType(category?.name)} ${className || ''}`}
        >
        {
            getCategoryIcon(category?.icon)
        }
        <p>{category?.name}</p>
        </ChipButton>
    );
});

export default Category;