import { memo } from "react";
import ChipButton from "../Ui/ChipButton";
import { getCategoryColorType } from "../../utils/format";
import "./Category.scss";

const Category = memo(({ name, icon, is_active, onClick }) => {
    return (
        <ChipButton 
            is_active={is_active} 
            onClick={onClick} 
            className={`category_content category_type_${getCategoryColorType(name)}`}
        >
            {icon && (
                <div 
                    className="category_svg_icon" 
                    dangerouslySetInnerHTML={{ __html: icon }} 
                />
            )}
            <p>{name}</p>
        </ChipButton>
    );
});

export default Category;