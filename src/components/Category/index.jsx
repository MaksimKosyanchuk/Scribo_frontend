import { memo } from "react";
import ChipButton from "../Ui/ChipButton";
import "./Category.scss";
import { useNavigate } from "react-router-dom";

import { ReactComponent as Icon1 } from "../../assets/svg/categories/1.svg";
import { ReactComponent as Icon2 } from "../../assets/svg/categories/2.svg";
import { ReactComponent as Icon3 } from "../../assets/svg/categories/3.svg";
import { ReactComponent as Icon4 } from "../../assets/svg/categories/4.svg";
import { ReactComponent as AlertIcon } from "../../assets/svg/alert.svg";

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
                return(<AlertIcon className="category_svg_icon"/>)
        }
    }

    return (
        <ChipButton 
            is_active={is_active} 
            onClick={ onClick ??  (() => { nagivate('/posts?filter=' + category?._id) } )  } 
            className={`category_content category_type_${category?.color} ${className || ''}`}
        >
        {
            getCategoryIcon(category?.icon)
        }
        <p>{category?.name}</p>
        </ChipButton>
    );
});

export default Category;