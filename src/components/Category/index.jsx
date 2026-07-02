import ChipButton from "../Ui/ChipButton";
import "./Category.scss";
import { getCategoryColorType } from "../../utils/format";

const Category = ({ name, icon, is_active, onClick}) => {

    return (
        <div className={`category_content app-transition category_type_${getCategoryColorType(name)}`}>
            <ChipButton is_active={is_active} onClick={onClick}>
                    {icon ? (
                        <div 
                            className="category_svg_icon" 
                            dangerouslySetInnerHTML={{ __html: icon }} 
                        />
                    ) : (
                        <></>
                    )}
                    <span>{name}</span>
            </ChipButton>
        </div>
    );
};

export default Category;