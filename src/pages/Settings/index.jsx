import { useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../App';

import { editProfile, changePassword } from '../../api/profile.api';
import { logout as logoutRequest, getSessions, deleteSession } from '../../api/auth.api';
import { format_back, format_date_time } from '../../utils/format';

import InputField from '../../components/Ui/InputField/index';
import DropFile from '../../components/Ui/DropFile/index';
import Toggle from '../../components/Ui/Toggle/index';
import PrimaryButton from '../../components/Ui/PrimaryButton';
import ActionButton from '../../components/Ui/ActionButton';
import DangerButton from '../../components/Ui/DangerButton';
import Field from '../../components/Ui/Field';
import Tooltip from '../../components/Ui/Tooltip';
import SidebarPage from '../../components/SidebarPage';

import "./Settings.scss";

import AvatarIcon from "../../assets/svg/avatar-icon.svg?react"
import ProfileIcon from "../../assets/svg/profile-icon.svg?react"
import ShieldIcon from "../../assets/svg/shield-security.svg?react"

const Settings = () => {
    const { profile, setProfile, profileLoading, showToast } = useContext(AppContext)
    const [ initialized, setInitialized ] = useState(false);
    const navigate = useNavigate();
    const [errors, setErrors] = useState({})
    const [isLoading, setIsLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [sessions, setSessions] = useState([]);
    const [sessionsLoading, setSessionsLoading] = useState(false);
    const [passwordFields, setPasswordFields] = useState({
        current_password: "",
        new_password: "",
        new_password_confirm: ""
    });

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

    useEffect(() => {
        if (!profile) {
            setSessions([]);
            return;
        }

        let cancelled = false

        const loadSessions = async () => {
            setSessionsLoading(true)
            const result = await getSessions()
            if (!cancelled && result?.status) {
                setSessions(result.data || [])
            }
            if (!cancelled) {
                setSessionsLoading(false)
            }
        }

        loadSessions()

        return () => {
            cancelled = true
        }
    }, [profile]);

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
        const other = { ...errors };
        delete other[fieldName];
        setErrors(other);
        
    };

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
                description: "Description cannot be longer than 60 characters!"
            }));
            is_error = true
        }
        return !is_error
    }

    const password_field_validation = () => {
        let is_error = false
        const next = {}

        if (passwordFields.current_password.length < 8 || passwordFields.current_password.length > 20) {
            next.current_password = "Пароль должен быть от 8 до 20 символов"
            is_error = true
        }
        if (passwordFields.new_password.length < 8 || passwordFields.new_password.length > 20) {
            next.new_password = "Пароль должен быть от 8 до 20 символов"
            is_error = true
        }
        if (passwordFields.new_password_confirm.length < 8 || passwordFields.new_password_confirm.length > 20) {
            next.new_password_confirm = "Пароль должен быть от 8 до 20 символов"
            is_error = true
        }
        if (!is_error && passwordFields.new_password !== passwordFields.new_password_confirm) {
            next.new_password_confirm = "Пароли не совпадают"
            is_error = true
        }
        if (!is_error && passwordFields.current_password === passwordFields.new_password) {
            next.new_password = "Новый пароль должен отличаться от текущего"
            is_error = true
        }

        if (is_error) {
            setErrors(prev => {
                const other = { ...prev }
                delete other.current_password
                delete other.new_password
                delete other.new_password_confirm
                return { ...other, ...next }
            })
        }

        return !is_error
    }

    const save_password = async () => {
        setPasswordLoading(true);
        if (!password_field_validation()) {
            setPasswordLoading(false);
            return
        }

        try {
            const result = await changePassword(passwordFields);

            setPasswordLoading(false);
            if (result.status === true) {
                setPasswordFields({
                    current_password: "",
                    new_password: "",
                    new_password_confirm: ""
                });
                setErrors(prev => {
                    const next = { ...prev };
                    delete next.current_password;
                    delete next.new_password;
                    delete next.new_password_confirm;
                    return next;
                });
                setChangingPassword(false);
                showToast({ message: "Пароль изменён", type: "success" });
            } else {
                if (result?.errors?.body) {
                    const formattedErrors = Object.fromEntries(
                        Object.entries(result.errors.body).map(
                            ([field, obj]) => [field, obj.message]
                        )
                    );

                    setErrors(prev => ({ ...prev, ...formattedErrors }));
                }
                showToast({ message: "Ошибка!", type: "error" });
            }
        } catch (error) {
            console.log(error);
            setPasswordLoading(false);
            showToast({ message: "Ошибка!", type: "error" });
        }
    };

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

    const handleLogout = async () => {
        await logoutRequest();
        setProfile(null);
        showToast({ message: "Вы вышли из аккаунта!", type: "success" });
        navigate("/posts");
    }

    const handleDeleteSession = async (session) => {
        const result = await deleteSession(session._id)

        if (!result?.status) {
            showToast({ message: "Не удалось завершить сеанс", type: "error" })
            return
        }

        if (result.data?.wasCurrent) {
            setProfile(null)
            showToast({ message: "Текущий сеанс завершён", type: "success" })
            navigate("/posts")
            return
        }

        setSessions(prev => prev.filter(item => item._id !== session._id))
        showToast({ message: "Сеанс удалён", type: "success" })
    }

    const handleAvatarRemove = () => {
        setFields(prev => ({
            ...prev,
            avatar: null
        }));
    };

    const openPasswordForm = () => {
        setPasswordFields({
            current_password: "",
            new_password: "",
            new_password_confirm: ""
        });
        setErrors(prev => {
            const next = { ...prev };
            delete next.current_password;
            delete next.new_password;
            delete next.new_password_confirm;
            return next;
        });
        setChangingPassword(true);
    };

    const closePasswordForm = () => {
        setPasswordFields({
            current_password: "",
            new_password: "",
            new_password_confirm: ""
        });
        setErrors(prev => {
            const next = { ...prev };
            delete next.current_password;
            delete next.new_password;
            delete next.new_password_confirm;
            return next;
        });
        setChangingPassword(false);
    };

    return (
        <div className="settings">
            <SidebarPage
                pageTitle="Настройки"
                pages={[
                    {
                        title: "Профиль",
                        key: "profile",
                        aliases: ["privacy"],
                        icon: <ProfileIcon />,
                        content: (
                            <form
                                className="settings_panel settings_panel_profile"
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    save_settings();
                                }}
                            >
                                <div className="settings_profile">
                                    <div className="settings_profile_avatar">
                                        <DropFile
                                            value={fields.avatar}
                                            setValue={(file) =>
                                                setFields(prev => ({ ...prev, avatar: file }))
                                            }
                                            background={<AvatarIcon className="drop_file_info_avatar_icon app-transition" />}
                                            dropFileType={"image/*"}
                                            fileTypes={"SVG, PNG, JPEG, JPG и другие"}
                                            errors={errors?.avatar}
                                            addNewErrors={add_errors_to_image}
                                            clearErrors={clear_errors_from_image}
                                            onRemove={handleAvatarRemove}
                                            previewUrl={profile?.avatar}
                                        />
                                    </div>
                                    <div className="settings_profile_fields">
                                        {profile?.email ? (
                                            <Field title="Почта">
                                                <InputField
                                                    type="email"
                                                    value={profile.email}
                                                    confirmed={Boolean(profile.is_verified)}
                                                    onChange={() => {}}
                                                />
                                            </Field>
                                        ) : null}
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
                                                isMultiline={true}
                                                length={60}
                                                rows={3}
                                                onChange={(e) => setFields({ ...fields, description: e.target.value })}
                                                onFocus={() => handleFocus('description')}
                                                placeholder="Description of profile"
                                                value={fields?.description}
                                                error={errors?.description ?? null}
                                            />
                                        </Field>
                                    </div>
                                </div>
                                <p className="settings_panel_hint">Конфиденциальность</p>
                                <div className="private_setting">
                                    <div className="private_setting_content app-transition">
                                        <div className="private_setting_content_item app-transition">
                                            <p>Отображать мой email в профиле</p>
                                            <Toggle
                                                checked={fields.is_email_public}
                                                onChange={set_email_visibility}
                                            />
                                        </div>
                                        <div className="private_setting_content_item app-transition">
                                            <p>Разрешить просмотр моих сохраненных постов</p>
                                            <Toggle
                                                checked={fields.is_saved_posts_public}
                                                onChange={set_saved_posts_visibility}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="settings_panel_actions">
                                    <PrimaryButton type="submit" isLoading={isLoading}>Сохранить</PrimaryButton>
                                </div>
                            </form>
                        )
                    },
                    {
                        title: "Безопасность",
                        key: "security",
                        aliases: ["sessions", "password"],
                        icon: <ShieldIcon />,
                        content: (
                            <div className="settings_panel">
                                {changingPassword ? (
                                    <form
                                        className="settings_password"
                                        onSubmit={(event) => {
                                            event.preventDefault();
                                            save_password();
                                        }}
                                    >
                                        <Field error={errors?.current_password ?? null} title={"Текущий пароль"}>
                                            <InputField
                                                type="password"
                                                autoComplete="current-password"
                                                length={20}
                                                onChange={(e) => setPasswordFields({ ...passwordFields, current_password: e.target.value })}
                                                onFocus={() => handleFocus('current_password')}
                                                placeholder="Текущий пароль"
                                                value={passwordFields.current_password}
                                                error={errors?.current_password ?? null}
                                            />
                                        </Field>
                                        <Field error={errors?.new_password ?? null} title={"Новый пароль"}>
                                            <InputField
                                                type="password"
                                                autoComplete="new-password"
                                                length={20}
                                                onChange={(e) => setPasswordFields({ ...passwordFields, new_password: e.target.value })}
                                                onFocus={() => handleFocus('new_password')}
                                                placeholder="Новый пароль"
                                                value={passwordFields.new_password}
                                                error={errors?.new_password ?? null}
                                            />
                                        </Field>
                                        <Field error={errors?.new_password_confirm ?? null} title={"Повторите новый пароль"}>
                                            <InputField
                                                type="password"
                                                autoComplete="new-password"
                                                length={20}
                                                onChange={(e) => setPasswordFields({ ...passwordFields, new_password_confirm: e.target.value })}
                                                onFocus={() => handleFocus('new_password_confirm')}
                                                placeholder="Повторите новый пароль"
                                                value={passwordFields.new_password_confirm}
                                                error={errors?.new_password_confirm ?? null}
                                            />
                                        </Field>
                                        <div className="settings_panel_actions">
                                            <PrimaryButton type="submit" isLoading={passwordLoading}>Изменить пароль</PrimaryButton>
                                            <ActionButton type="button" onClick={closePasswordForm}>Отмена</ActionButton>
                                        </div>
                                    </form>
                                ) : (
                                    <Field title="Пароль">
                                        <div className="settings_password_preview">
                                            <InputField
                                                type="password"
                                                value="********"
                                                readOnly
                                                tabIndex={-1}
                                                onChange={() => {}}
                                            />
                                            <ActionButton type="button" onClick={openPasswordForm}>
                                                Сменить пароль
                                            </ActionButton>
                                        </div>
                                    </Field>
                                )}
                                <p className="settings_panel_hint">Устройства, с которых выполнен вход</p>
                                <div className="settings_sessions">
                                    {sessionsLoading ? (
                                        <p className="settings_sessions_empty">Загрузка…</p>
                                    ) : sessions.length === 0 ? (
                                        <p className="settings_sessions_empty">Нет активных сеансов</p>
                                    ) : (
                                        sessions.map((session) => (
                                            <div
                                                className="settings_sessions_item app-transition"
                                                key={session._id}
                                            >
                                                <div className="settings_sessions_item_info">
                                                    <div className="settings_sessions_item_head">
                                                        <p className="settings_sessions_item_device">{session.device}</p>
                                                        {session.isCurrent ? (
                                                            <span className="settings_sessions_badge app-transition">Этот сеанс</span>
                                                        ) : null}
                                                    </div>
                                                    <p className="settings_sessions_item_location">{session.location || "—"}</p>
                                                    <Tooltip text={format_date_time(session.lastSeen)}>
                                                        <p className="settings_sessions_item_time">
                                                            {format_back(session.lastSeen) || format_date_time(session.lastSeen)}
                                                        </p>
                                                    </Tooltip>
                                                </div>
                                                <DangerButton type="button" onClick={() => handleDeleteSession(session)}>
                                                    Завершить
                                                </DangerButton>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="settings_logout">
                                    <DangerButton className="logout_button" type="button" onClick={handleLogout}>
                                        Выйти с аккаунта
                                    </DangerButton>
                                </div>
                            </div>
                        )
                    }
                ]}
            />
        </div>
    );
};


export default Settings;
