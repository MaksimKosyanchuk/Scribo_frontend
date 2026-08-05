import { useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../App';

import { editProfile } from '../../api/profile.api';

import InputField from '../../components/Ui/InputField/index';
import DropFile from '../../components/Ui/DropFile/index';
import Toggle from '../../components/Ui/Toggle/index';
import PrimaryButton from '../../components/Ui/PrimaryButton';
import DangerButton from '../../components/Ui/DangerButton';
import Field from '../../components/Ui/Field';

import "./Settings.scss";

import { ReactComponent as AvatarIcon } from "../../assets/svg/avatar-icon.svg"

const Settings = () => {
    const { profile, setProfile, profileLoading, showToast, isDarkTheme, setIsDarkTheme } = useContext(AppContext)
    const [ initialized, setInitialized ] = useState(false);
    const navigate = useNavigate();
    const [errors, setErrors] = useState({})
    const [isLoading, setIsLoading] = useState(false);

    const [ fields, setFields ] = useState(
        {
            nick_name: '',
            description: '',
            is_email_public: false,
            is_saved_posts_public: false,
            avatar: null
        }
    )

    const set_email_visibility = (visibility) => {
        setFields(prev => ({
            ...prev,
            is_email_public: visibility
        }))
    }
    
    const set_saved_posts_visibility = (visibility) => {
        setFields(prev => ({
            ...prev,
            is_saved_posts_public: visibility
        }))
    }

    useEffect(() => {
        if (!initialized) {
            setInitialized(true);
            return;
        }

        if (!profileLoading && (!profile)) {
            navigate("/posts");
            return;
        }

        const setProfileData = async () => {
            if (!profile) return;

            setFields(prev => ({
                ...prev,
                nick_name: profile.nick_name ?? "",
                description: profile.description ?? "",
                avatar: profile.avatar,
                is_email_public: profile.is_email_public,
                is_saved_posts_public: profile.is_saved_posts_public
            }));
        };

        setProfileData();
    }, [profileLoading, profile, initialized, navigate]);

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

    const handleFocus = (fieldName) => {
        const { [fieldName]: removedField, ...other } = errors;
        setErrors (other)
    }

    const field_validation = () => {
        let is_error = false
        if (fields.nick_name.length < 3) {
            setErrors(prevErrors => ({
                ...prevErrors,
                nick_name: "Username must be at least 3 characters long!"
            }));
            is_error = true
        }
        if (fields.nick_name.length > 20) {
            setErrors(prevErrors => ({
                ...prevErrors,
                nick_name: "Username cannot be longer than 20 characters!"
            }));
            is_error = true
        }
        if (fields.description.length > 60) {
            setErrors(prevErrors => ({
                ...prevErrors,
                password: "Description cannot be longer than 60 characters!"
            }));
            is_error = true
        }
        return !is_error
    }

    const save_settings = async () => {
        setIsLoading(true);
        if(!field_validation()) {
            setIsLoading(false);
            return
        }

        const formData = new FormData();

        const avatarChanged =
            fields.avatar instanceof File ||
            fields.avatar !== (profile?.avatar ?? null);

        for (let field in fields) {
            if (field === 'avatar') {
                continue;
            }

            if (fields[field] === profile[field]) continue
            formData.append(field, fields[field])
        }

        if (avatarChanged) {
            formData.append('avatar', fields.avatar ?? '');
        }

        try {
            const result = await editProfile(formData);

            setIsLoading(false);
            if (result.status === true) {
                setProfile(prev => ({
                    ...prev,
                    ...result.data
                }));
                navigate(result.data.nick_name ? `/users/${result.data.nick_name}` : `/users/${profile.nick_name}`);
                showToast({ message: "Успешно сохранено!", type: "success" });
            } else {
                if (result?.errors?.body) {
                    const formattedErrors = Object.fromEntries(
                        Object.entries(result.errors.body).map(
                            ([field, obj]) => [field, obj.message]
                        )
                    );

                    setErrors(formattedErrors);
                }
                showToast({ message: "Ошибка!", type: "error" });
                return result;
            }
        } catch (error) {
            console.log(error);
            if(error instanceof TypeError && error.message === "Failed to fetch") {
                setErrors({
                    "avatar": [ "Max size of image is 5 mb"] 
                })
            }
            return { status: "error", message: "server not found" };
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        setProfile(null);
        showToast({ message: "Вы вышли из аккаунта!", type: "success" });
        navigate("/posts");
    }

    const handleAvatarRemove = () => {
        setFields(prev => ({
            ...prev,
            avatar: null
        }));
    };

    return (
        <div className='settings'>
            <form className='form_input app-transition' onSubmit={(e) => save_settings(e) }>
                <>
                    <div className='top_side'>
                        <DropFile
                            value={fields.avatar}
                            setValue={(file) =>
                                setFields(prev => ({ ...prev, avatar: file }))
                            }
                            background={<AvatarIcon className="drop_file_info_avatar_icon app-transition" />}
                            drop_file_type={"image/*"}
                            file_types={"SVG, PNG, JPEG, JPG и другие"}
                            errors={errors?.avatar}
                            add_new_errors={add_errors_to_image}
                            clear_errors={clear_errors_from_image}
                            onRemove={handleAvatarRemove}
                            preview_url={profile?.avatar}
                        />
                        <div className='email'>
                            <p className='email_label'>
                                {profile?.email}
                            </p>
                        </div>
                    </div>
                        <div className='private_setting'>
                            <div className='private_setting_title'>
                                <p>Приватность</p>
                            </div>
                            <div className='private_setting_content app-transition'>
                                <div className='private_setting_content_item app-transition'>
                                    <p>Отображать мой email в профиле</p>
                                    <Toggle 
                                        checked={fields.is_email_public}
                                        onChange={set_email_visibility}
                                    />
                                </div>
                                <div className='private_setting_content_item app-transition'>
                                    <p>Разрешить просмотр моих сохраненных постов</p>
                                    <Toggle 
                                        checked={fields.is_saved_posts_public}
                                        onChange={set_saved_posts_visibility}
                                    />
                                </div>
                                <div className='private_setting_content_item app-transition'>
                                    <p>Темная тема</p>
                                    <Toggle 
                                        checked={isDarkTheme}
                                        onChange={setIsDarkTheme}
                                    />
                                </div>
                            </div>
                        </div>
                    <Field error={errors?.nick_name ?? null} title={"Имя пользователя"}>
                        <InputField
                            className={`user_name`}
                            type="text"
                            onChange={(e) => setFields({ ...fields, nick_name: e.target.value })}
                            onFocus={() => handleFocus('nick_name')}
                            placeholder="User Name"
                            value={fields?.nick_name}
                            error={errors?.nick_name ?? null}
                        />
                    </Field>
                    <Field error={errors?.description ?? null} title={"Описание"}>
                        <InputField
                            className={`description`}
                            type="text"
                            is_multiline = {true}
                            length={60}
                            rows={3}
                            onChange={(e) => setFields({ ...fields, description: e.target.value })}
                            onFocus={() => handleFocus('description')}
                            placeholder="Description of profile"
                            value={fields?.description}
                            error={errors?.description ?? null}
                        />
                    </Field>
                    <div className='form_input_buttons'>
                        <PrimaryButton type='button' is_loading={isLoading} onClick={save_settings}>Сохранить</PrimaryButton>
                        <DangerButton className="logout_button app-transition" type="button" onClick={logout}>Выйти с аккаунта</DangerButton>
                    </div>
                </>
            </form>
        </div>
    );
};


export default Settings;
