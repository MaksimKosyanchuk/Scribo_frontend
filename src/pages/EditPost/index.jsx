import { useNavigate } from 'react-router-dom';
import { useParams } from "react-router"
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../App';
import { API_URL } from '../../config';
import DropFile from '../../components/Ui/DropFile/index';
import InputFiled from "../../components/Ui/InputField";
import TextEditorField from "../../components/Ui/TextEditorField";
import PrimaryButton from "../../components/Ui/PrimaryButton";
import DangerButton from "../../components/Ui/DangerButton";
import { getPostById } from '../../api/posts.api';
import "./EditPost.scss"

const EditPost = () => {
    const navigate = useNavigate()
    const { profile, profileLoading, showToast } = useContext(AppContext)
    const [ initialized, setInitialized ] = useState(false);
    const [ createResult, setCreateResult ] = useState({})
    const [errors, setErrors] = useState({ });
    const [featuredImage, setFeaturedImage] = useState(null)

    const { id } = useParams()

    const [ isLoading, setIsLoading ] = useState(false);

    const [ fields, setFields ] = useState(
        {
            title: '',
            content_text: '',
            featured_image: null,
            category: ''
        }
    )

    useEffect(() => {
        const loadPost = async () => {
            if (!id) return

            const result = await getPostById(id)
            if (result?.status === true && result?.data) {
                const post = result.data
                setFields({
                    title: post.title ?? '',
                    content_text: post.content_text ?? '',
                    category: post.category ?? '',
                    featured_image: post.featured_image ?? null
                })
                setFeaturedImage(post.featured_image)
            }
        }

        loadPost()
    }, [id])

    // useEffect(() => {
    //     console.log(fields)
    // }, [fields])

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
        if(initialized){
            if(!profileLoading && (!profile || !profile.is_admin)){
                navigate("/posts")
            }
        }
        else {
            setInitialized(true);
        }
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

    const create_post = async () => {
        const formData = new FormData();
        formData.append('title', fields.title)
        formData.append('content_text', fields.content_text)

        const isImageChanged = fields.featured_image instanceof File ||
            fields.featured_image !== (featuredImage ?? null);
        if (isImageChanged) {
            formData.append('featured_image', fields.featured_image);
        }
        
        formData.append('category', fields.category)

        const headers = {
            'Authorization': `Bearer ${localStorage.getItem("token")}`
        }

        try {
            const creating = await fetch(`${API_URL}/api/posts/${id}`, { method: "PATCH", body: formData, headers: headers})
            const result = await creating.json()
            if(result.status === true) {
                navigate("/posts")
                showToast({ message: "Изменено!", type: "success" })
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
                value={fields.title}
                className={"create_post_title"  + (createResult.status === "error" && createResult.message === "Incorrect 'title'" ? " incorrect_field" : "")}
                placeholder={"Введите заголовок"}
                is_multiline={true}
                multiline_rows={1}
                onChange={(e) => setFields({ ...fields, title: e.target.value })}
                onFocus={() => handleFocus('title')}
                length={200}
                error={errors?.body?.title?.message}
            />
            <InputFiled 
                value={fields.category}
                className={"create_post_category"  + (createResult.status === false && createResult?.message?.body?.category ? " incorrect_field" : "")}
                placeholder={"Укажите категорию"}
                is_multiline={true}
                multiline_rows={1}
                onChange={(e) => setFields({ ...fields, category: e.target.value })}
                onFocus={() => handleFocus('category')}
                length={50}
                error={errors?.body?.category?.message}
            />
            <DropFile
                value={fields.featured_image}
                setValue={(file) =>
                    setFields(prev => ({
                        ...prev,
                        featured_image: file
                    }))
                }
                drop_file_type={"image/*"}
                file_types={"SVG, PNG, JPEG, JPG и другие"}
                errors={errors?.body?.featured_image?.message}
                add_new_errors={add_errors_to_image}
                clear_errors={clear_errors_from_image}
                onRemove={handleClick}
                preview_url={fields.featured_image}
            />
            <TextEditorField initialHtml={fields.content_text} onFocus={() => handleFocus('content_text')} onChange={(html) => setFields({ ...fields, content_text: html })} error={errors?.body?.content_text?.message}/>
            <div className="create_post_buttons">
                <PrimaryButton onClick={handleSubmit} is_loading={isLoading}>Сохранить</PrimaryButton>
                <DangerButton onClick={() => navigate("/posts")}>Отмена</DangerButton>
            </div>
        </form>
    )
}

export default EditPost
