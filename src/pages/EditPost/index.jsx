import { useNavigate } from 'react-router-dom';
import { useParams } from "react-router"
import { useContext, useEffect, useState, useMemo } from 'react';
import { AppContext } from '../../App';

import DropFile from '../../components/Ui/DropFile/index';
import InputFiled from "../../components/Ui/InputField";
import TextEditorField from "../../components/Ui/TextEditorField";
import PrimaryButton from "../../components/Ui/PrimaryButton";
import DangerButton from "../../components/Ui/DangerButton";
import Field from "../../components/Ui/Field";

import { CATEGORY_COLORS } from "../../styles/constants";

import { getPostById, editPost } from '../../api/posts.api';
import { getCategories } from '../../api/categories.api';
import { FIELD_LIMITS } from '../../constants/fieldLimits';

import "./EditPost.scss"

import SearchSelect from '../../components/Ui/SearchSelect/index';

const EditPost = () => {
    const navigate = useNavigate()
    const { profile, profileLoading, showToast } = useContext(AppContext)
    const [ createResult, setCreateResult ] = useState({})
    const [errors, setErrors] = useState({ });
    const [featuredImage, setFeaturedImage] = useState(null)
    const [allCategories, setAllCategories] = useState([])

    const { id } = useParams()
    
    const [ isLoading, setIsLoading ] = useState(false);

    const [ fields, setFields ] = useState(
        {
            postTitle: '',
            postContent: '',
            featuredImage: null,
            categoryId: ''
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

    useEffect(() => {
        const loadPost = async () => {
            if (!id) return

            const result = await getPostById(id)
            if (result?.status === true && result?.data) {
                const post = result.data
                setFields({
                    postTitle: post.title ?? '',
                    postContent: post.content_text ?? '',
                    categoryId: post.category?._id ?? post.category ?? '',
                    featuredImage: post.featured_image ?? null,
                    author: post.author ?? null
                })
                setFeaturedImage(post.featured_image)
            }

            const categories_result = await getCategories()

            if(categories_result?.status === true) {
                for(const category of categories_result.data) {
                    category.className = CATEGORY_COLORS[category.color]?.className
                    category.value = category._id
                }
                setAllCategories(categories_result.data)
            }
        }

        loadPost()
    }, [id])

    const add_errors_to_image = (new_errors) => {
        const updated_errors = { ...errors };

        if (!updated_errors.featuredImage) { 
            updated_errors.featuredImage = [];
        }

        for(const new_error of new_errors) {
            updated_errors.featuredImage.push(new_error)
        }
        setErrors(updated_errors);
    }

    const clear_errors_from_image = () => {
        const updated_errors = { ...errors };

        if(updated_errors.featuredImage) {
            delete updated_errors.featuredImage
        }

        setErrors(updated_errors)
    }

    useEffect(() => {
        if (
            profileLoading ||
            !profile ||
            !fields.author
        ) {
            return;
        }

        const canEdit =
            profile.permissions?.includes("edit_any_post") ||
            profile._id.toString() === fields.author.toString();

        if (!canEdit) {
            navigate("/posts");
        }
    }, [profileLoading, profile, fields.author, navigate]);

    const handleClick = () => {
        const other = { ...errors };
        delete other.featuredImage;
        setErrors(other);
    };

    const handleSubmit = async (e) => {
        e.preventDefault()
        const next = {};
        const title = (fields.postTitle || '').trim();
        if (title.length < FIELD_LIMITS.postTitle.min) {
            next.postTitle = 'Введите заголовок';
        } else if (title.length > FIELD_LIMITS.postTitle.max) {
            next.postTitle = `Заголовок не длиннее ${FIELD_LIMITS.postTitle.max} символов`;
        }
        if (!(fields.postContent || '').trim()) {
            next.postContent = 'Введите текст поста';
        } else if (fields.postContent.length > FIELD_LIMITS.postContent.max) {
            next.postContent = `Текст не длиннее ${FIELD_LIMITS.postContent.max} символов`;
        }
        if (Object.keys(next).length) {
            setErrors(prev => ({ ...prev, ...next }));
            return;
        }
        setIsLoading(true);
        const result = await create_post()
        setIsLoading(false);
        setCreateResult(result)
    }

    const handleFocus = (fieldName) => {
        const other = { ...errors };
        delete other[fieldName];
        setErrors(other);
    };

    const create_post = async () => {
        const formData = new FormData();
        formData.append('postTitle', fields.postTitle)
        formData.append('postContent', fields.postContent)

        const isImageChanged = fields.featuredImage instanceof File ||
            fields.featuredImage !== (featuredImage ?? null);
        if (isImageChanged) {
            formData.append('featuredImage', fields.featuredImage);
        }
        
        formData.append('categoryId', fields.categoryId)

        const result = await editPost(id, formData)
        
        if(result.status === true) {
            navigate("/posts")
            showToast({ message: "Пост успешно отредактирован!", type: "success" })
            return result
        }
        else {
            showToast({ message: "Ошибка при редактировании поста!", type: "error" })
            if (result?.errors?.body) {
                setErrors(Object.fromEntries(Object.entries(result.errors.body).map(([field, obj]) => [field, obj.message])));
            }
            return result
        }
    }

    return (
        <form className="edit_post" onSubmit={handleSubmit}>
            <Field
                error={errors?.postTitle}
                title={"Заголовок"}
            >
                <InputFiled
                    value={fields.postTitle}
                    placeholder={titlePlaceholder}
                    className={
                        "edit_post_title" +
                        (
                            createResult.status === "error" &&
                            createResult.message === "Incorrect 'title'"
                                ? " incorrect_field"
                                : ""
                        )
                    }
                    isMultiline={true}
                    multilineRows={1}
                    onChange={(e) =>
                        setFields({
                            ...fields,
                            postTitle: e.target.value
                        })
                    }
                    onFocus={() => handleFocus("postTitle")}
                    length={FIELD_LIMITS.postTitle.max}
                    error={errors?.postTitle}
                />
            </Field>

            <Field
                error={errors?.categoryId}
                title={"Категория"}
            >
                <SearchSelect
                    value={fields?.categoryId}
                    onSetValue={(value) =>
                        setFields((prev) => ({
                            ...prev,
                            categoryId: value
                        }))
                    }
                    onFocus={() => handleFocus("categoryId")}
                    error={errors?.categoryId}
                    options={allCategories}
                />
            </Field>

            <DropFile
                value={fields.featuredImage}
                setValue={(file) =>
                    setFields((prev) => ({
                        ...prev,
                        featuredImage: file
                    }))
                }
                dropFileType={"image/*"}
                fileTypes={"SVG, PNG, JPEG, JPG и другие"}
                errors={errors?.featuredImage}
                addNewErrors={add_errors_to_image}
                clearErrors={clear_errors_from_image}
                onRemove={handleClick}
                previewUrl={fields.featuredImage}
            />

            <Field
                error={errors?.postContent}
                title={"Текст поста"}
            >
                <TextEditorField
                    initialHtml={fields.postContent}
                    onFocus={() => handleFocus("postContent")}
                    onChange={(html) =>
                        setFields({
                            ...fields,
                            postContent: html
                        })
                    }
                    error={errors?.postContent}
                />
            </Field>

            <div className="edit_post_buttons">
                <PrimaryButton
                    onClick={handleSubmit}
                    isLoading={isLoading}
                >
                    Сохранить
                </PrimaryButton>

                <DangerButton disabled={isLoading} onClick={() => navigate("/posts")}>
                    Отмена
                </DangerButton>
            </div>
        </form>
    );
}

export default EditPost
