import { useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState, useMemo } from 'react';

import { AppContext } from '../../App';

import { API_URL } from '../../config';

import DropFile from '../../components/Ui/DropFile/index';
import InputFiled from "../../components/Ui/InputField";
import TextEditorField from "../../components/Ui/TextEditorField";
import PrimaryButton from "../../components/Ui/PrimaryButton";
import DangerButton from "../../components/Ui/DangerButton";
import SearchSelect from '../../components/Ui/SearchSelect/index';

import { CATEGORY_COLORS } from "../../styles/constants";

import { getCategories } from '../../api/categories.api';

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

import "./CreatePost.scss"

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


const CreatePost = () => {
    const navigate = useNavigate()
    const { profile, profileLoading, showToast } = useContext(AppContext)
    const [ initialized, setInitialized ] = useState(false);
    const [ createResult, setCreateResult ] = useState({})
    const [errors, setErrors] = useState({ });
    const [allCategories, setAllCategories] = useState([])

    const [ isLoading, setIsLoading ] = useState(false);

    const [ fields, setFields ] = useState(
        {
            title: '',
            content_text: '',
            featured_image: null,
            category: ''
        }
    )

    const titlePlaceholder = useMemo(() => {
        const titleExamples = [
            "Экстренная нехватка бензина в россии",
            "5 способов отмыва денег через криптовалюту",
            "На Марсе снова ничего не нашли, но все довольны",
            "Колосальные потери под Малой Токмачкой - ВС рф",
            "Отряд бабок в россии отменил сам себя",
            "Токсис стал настолько популярным, что его стали узнавать собственные родители",
            "Учёные нашли кореляцию между походом за хлебом и рождением ребенка в молодых семьях",
            "В россии импортозаместили импортозамещение",
            "В россии нашли виноватого. Им оказался предыдущий виноватый",
            "На дне Марианской впадины наконец-то обнаружили дно российской экономики, но снизу снова постучали",
            "По опросам 90% жителей согласны с тем, о чем их еще не спрашивали"
        ];

        return titleExamples[Math.floor(Math.random() * titleExamples.length)];
    }, []);

    const add_errors_to_image = (new_errors) => {
        const updated_errors = { ...errors };

        if (!updated_errors.featured_image) { 
            updated_errors.featured_image = [];
        }

        for(const new_error of new_errors) {
            updated_errors.featured_image.push(new_error)
        }
        setErrors(updated_errors);
    }

    const clear_errors_from_image = () => {
        const updated_errors = { ...errors };

        if(updated_errors.featured_image) {
            delete updated_errors.featured_image
        }

        setErrors(updated_errors)
    }

    useEffect(() => {
        const load = async () => {
            if(initialized){
                if(!profileLoading && (!profile || !profile.is_admin)){
                    navigate("/posts")
                }
            }
            else{
                setInitialized(true);
    
                const categories_result = await getCategories()

                if(categories_result?.status === true) {
                    for(const category of categories_result.data) {
                        category.className = CATEGORY_COLORS[category.color]?.className
                        category.value = category._id

                        category.iconObject = categoryIcons[category.icon];
                    }
                    setAllCategories(categories_result.data)
                }
            }
        }

        load()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[profileLoading, initialized])

    const handleClick = () => {
        const { featured_image: removedField, ...other } = errors;
        setErrors (other)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true);
        const result = await create_post(fields.title, fields.content_text)
        setIsLoading(false);
        setCreateResult(result)
    }

    const handleFocus = (fieldName) => {
        setErrors(prevErrors => ({
            ...prevErrors,
            body: Object.fromEntries(
                Object.entries(prevErrors.body || {}).filter(
                    ([key]) => key !== fieldName
                )
            )
        }));
    };

    const create_post = async (title, mainText) => {
        const formData = new FormData();
        formData.append('title', title)
        formData.append('content_text', fields.content_text)
        formData.append('featured_image', fields.featured_image)
        formData.append('category', fields.category)

        const headers = {
            'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
        try{
            const creating = await fetch(`${API_URL}/api/posts`, { method: "POST", body: formData, headers: headers})
            const result = await creating.json()
            if(result.status === true) {
                navigate("/posts")
                showToast({ message: "Опубликовано!", type: "success" })
                return result
            }
            else{
                if(result?.errors && Object.keys(result?.errors).length > 0) {
                    setErrors(result.errors)
                }
                return result
            }
        } 
        catch(e){
            return {
                status: "error",
                message: "server not found"
            }
        }
    }

    return (
        <form className='create_post' onSubmit={handleSubmit}>
            <InputFiled 
                input_label={"Заголовок"}
                placeholder={titlePlaceholder}
                className={"create_post_title"  + (createResult.status === "error" && createResult.message === "Incorrect 'title'" ? " incorrect_field" : "")}
                is_multiline={true}
                multiline_rows={1}
                onChange={(e) => setFields({ ...fields, title: e.target.value })}
                onFocus={() => handleFocus('title')}
                length={200}
                error={errors?.body?.title?.message}
            />
            <SearchSelect
                value={fields.category}
                onSetValue={(value) =>
                    setFields(prev => ({
                        ...prev,
                        category: value
                    }))
                }
                input_label={"Категория"}
                className={CATEGORY_COLORS[allCategories.find(category => category._id === fields.category)?.color]?.className}
                options={allCategories}
            />
            <DropFile
                value={fields.featured_image}
                setValue={(file) => setFields({ ...fields, featured_image: file })}
                drop_file_type={"image/*"}
                file_types={"SVG, PNG, JPEG, JPG и другие"}
                errors={errors?.body?.featured_image?.message}
                add_new_errors={add_errors_to_image}
                clear_errors={clear_errors_from_image}
                onRemove={handleClick}
            />
            <TextEditorField onFocus={() => handleFocus('content_text')} onChange={(html) => setFields({ ...fields, content_text: html })} error={errors?.body?.content_text?.message}/>
            <div className="create_post_buttons">
                <PrimaryButton onClick={handleSubmit} is_loading={isLoading}>Создать пост</PrimaryButton>
                <DangerButton onClick={() => navigate("/posts")}>Отмена</DangerButton>
            </div>
        </form>
    )
}

export default CreatePost
