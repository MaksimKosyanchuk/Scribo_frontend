import { useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../App';

import { editProfile, changePassword } from '../../api/profile.api';
import { logout as logoutRequest, getSessions, deleteSession } from '../../api/auth.api';
import { FIELD_LIMITS } from '../../constants/fieldLimits';
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
    const [logoutLoading, setLogoutLoading] = useState(false);
    const [endingSessionId, setEndingSessionId] = useState(null);
    const [passwordFields, setPasswordFields] = useState({
        currentPassword: "",
        newPassword: "",
        newPasswordConfirm: ""
    });

    const [ fields, setFields ] = useState(
        {
            userNickName: '',
            userDescription: '',
            isEmailPublic: false,
            isSavedPostsPublic: false,
            userAvatar: null
        }
    )

    const set_email_visibility = (visibility) => {
        setFields(prev => ({
            ...prev,
            isEmailPublic: visibility
        }))
    }
    
    const set_saved_posts_visibility = (visibility) => {
        setFields(prev => ({
            ...prev,
            isSavedPostsPublic: visibility
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
                userNickName: profile.nick_name ?? "",
                userDescription: profile.description ?? "",
                userAvatar: profile.avatar,
                isEmailPublic: profile.is_email_public,
                isSavedPostsPublic: profile.is_saved_posts_public
            }));
        };

        setProfileData();
    }, [profileLoading, profile, initialized, navigate]);

    useEffect(() => {
        let cancelled = false

        const loadSessions = async () => {
            setSessionsLoading(true)
            const result = await getSessions()
            if (!cancelled && result?.status) {
                const list = Array.isArray(result.data)
                    ? result.data
                    : Array.isArray(result.data?.sessions)
                        ? result.data.sessions
                        : [];
                setSessions(list);
            }
            if (!cancelled) {
                setSessionsLoading(false)
            }
        }

        loadSessions()

        return () => {
            cancelled = true
        }
    }, []);

    const add_errors_to_image = (new_errors) => {
        const updated_errors = { ...errors };

        if (!updated_errors.userAvatar) { 
            updated_errors.userAvatar = [];
        }

        for(const new_error of new_errors) {
            updated_errors.userAvatar.push(new_error)
        }
        setErrors(updated_errors);
    }

    const clear_errors_from_image = () => {
        const updated_errors = { ...errors };

        if(updated_errors.userAvatar) {
            delete updated_errors.userAvatar
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
        if (fields.userNickName.length < FIELD_LIMITS.nick.min) {
            setErrors(prevErrors => ({
                ...prevErrors,
                userNickName: `Имя должно быть не короче ${FIELD_LIMITS.nick.min} символов`
            }));
            is_error = true
        }
        if (fields.userNickName.length > FIELD_LIMITS.nick.max) {
            setErrors(prevErrors => ({
                ...prevErrors,
                userNickName: `Имя не длиннее ${FIELD_LIMITS.nick.max} символов`
            }));
            is_error = true
        }
        if (fields.userDescription.length > FIELD_LIMITS.description.max) {
            setErrors(prevErrors => ({
                ...prevErrors,
                userDescription: `Описание не длиннее ${FIELD_LIMITS.description.max} символов`
            }));
            is_error = true
        }
        return !is_error
    }

    const password_field_validation = () => {
        let is_error = false
        const next = {}

        if (passwordFields.currentPassword.length < FIELD_LIMITS.password.min || passwordFields.currentPassword.length > FIELD_LIMITS.password.max) {
            next.currentPassword = `Пароль должен быть от ${FIELD_LIMITS.password.min} до ${FIELD_LIMITS.password.max} символов`
            is_error = true
        }
        if (passwordFields.newPassword.length < FIELD_LIMITS.password.min || passwordFields.newPassword.length > FIELD_LIMITS.password.max) {
            next.newPassword = `Пароль должен быть от ${FIELD_LIMITS.password.min} до ${FIELD_LIMITS.password.max} символов`
            is_error = true
        }
        if (passwordFields.newPasswordConfirm.length < FIELD_LIMITS.password.min || passwordFields.newPasswordConfirm.length > FIELD_LIMITS.password.max) {
            next.newPasswordConfirm = `Пароль должен быть от ${FIELD_LIMITS.password.min} до ${FIELD_LIMITS.password.max} символов`
            is_error = true
        }
        if (!is_error && passwordFields.newPassword !== passwordFields.newPasswordConfirm) {
            next.newPasswordConfirm = "Пароли не совпадают"
            is_error = true
        }
        if (!is_error && passwordFields.currentPassword === passwordFields.newPassword) {
            next.newPassword = "Новый пароль должен отличаться от текущего"
            is_error = true
        }

        if (is_error) {
            setErrors(prev => {
                const other = { ...prev }
                delete other.currentPassword
                delete other.newPassword
                delete other.newPasswordConfirm
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
                    currentPassword: "",
                    newPassword: "",
                    newPasswordConfirm: ""
                });
                setErrors(prev => {
                    const next = { ...prev };
                    delete next.currentPassword;
                    delete next.newPassword;
                    delete next.newPasswordConfirm;
                    return next;
                });
                setChangingPassword(false);
                showToast({ message: "Пароль изменён", type: "success" });
            } else {
                if (result?.errors?.body) {
                    const formattedErrors = Object.fromEntries(Object.entries(result.errors.body).map(([field, obj]) => [field, obj.message]));

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
            fields.userAvatar instanceof File ||
            fields.userAvatar !== (profile?.avatar ?? null);

        const profileCompare = {
            userNickName: profile.nick_name ?? "",
            userDescription: profile.description ?? "",
            isEmailPublic: profile.is_email_public,
            isSavedPostsPublic: profile.is_saved_posts_public
        }

        for (let field in fields) {
            if (field === 'userAvatar') {
                continue;
            }

            if (fields[field] === profileCompare[field]) continue
            formData.append(field, fields[field])
        }

        if (avatarChanged) {
            formData.append('userAvatar', fields.userAvatar ?? '');
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
                    setErrors(Object.fromEntries(Object.entries(result.errors.body).map(([field, obj]) => [field, obj.message])));
                }
                showToast({ message: "Ошибка!", type: "error" });
                return result;
            }
        } catch (error) {
            console.log(error);
            if(error instanceof TypeError && error.message === "Failed to fetch") {
                setErrors({
                    userAvatar: [ "Max size of image is 5 mb"] 
                })
            }
            return { status: "error", message: "server not found" };
        }
    };

    const handleLogout = async () => {
        setLogoutLoading(true)
        try {
            await logoutRequest();
            setProfile(null);
            showToast({ message: "Вы вышли из аккаунта!", type: "success" });
            navigate("/posts");
        } finally {
            setLogoutLoading(false)
        }
    }

    const handleDeleteSession = async (session) => {
        setEndingSessionId(session._id)
        try {
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
        } finally {
            setEndingSessionId(null)
        }
    }

    const handleAvatarRemove = () => {
        setFields(prev => ({
            ...prev,
            userAvatar: null
        }));
    };

    const openPasswordForm = () => {
        setPasswordFields({
            currentPassword: "",
            newPassword: "",
            newPasswordConfirm: ""
        });
        setErrors(prev => {
            const next = { ...prev };
            delete next.currentPassword;
            delete next.newPassword;
            delete next.newPasswordConfirm;
            return next;
        });
        setChangingPassword(true);
    };

    const closePasswordForm = () => {
        setPasswordFields({
            currentPassword: "",
            newPassword: "",
            newPasswordConfirm: ""
        });
        setErrors(prev => {
            const next = { ...prev };
            delete next.currentPassword;
            delete next.newPassword;
            delete next.newPasswordConfirm;
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
                                            value={fields.userAvatar}
                                            setValue={(file) =>
                                                setFields(prev => ({ ...prev, userAvatar: file }))
                                            }
                                            background={<AvatarIcon className="drop_file_info_avatar_icon app-transition" />}
                                            dropFileType={"image/*"}
                                            fileTypes={"SVG, PNG, JPEG, JPG и другие"}
                                            errors={errors?.userAvatar}
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
                                        <Field error={errors?.userNickName ?? null} title={"Имя пользователя"}>
                                            <InputField
                                                className={`user_name`}
                                                type="text"
                                                onChange={(e) => setFields({ ...fields, userNickName: e.target.value })}
                                                onFocus={() => handleFocus('userNickName')}
                                                placeholder="User Name"
                                                value={fields?.userNickName}
                                                error={errors?.userNickName ?? null}
                                                length={FIELD_LIMITS.nick.max}
                                            />
                                        </Field>
                                        <Field error={errors?.userDescription ?? null} title={"Описание"}>
                                            <InputField
                                                className={`description`}
                                                type="text"
                                                isMultiline={true}
                                                length={FIELD_LIMITS.description.max}
                                                rows={3}
                                                onChange={(e) => setFields({ ...fields, userDescription: e.target.value })}
                                                onFocus={() => handleFocus('userDescription')}
                                                placeholder="Description of profile"
                                                value={fields?.userDescription}
                                                error={errors?.userDescription ?? null}
                                            />
                                        </Field>
                                    </div>
                                </div>
                                <p className="kicker settings_panel_hint">Конфиденциальность</p>
                                <div className="private_setting">
                                    <div className="private_setting_content app-transition">
                                        <div className="private_setting_content_item app-transition">
                                            <p>Отображать мой email в профиле</p>
                                            <Toggle
                                                checked={fields.isEmailPublic}
                                                onChange={set_email_visibility}
                                            />
                                        </div>
                                        <div className="private_setting_content_item app-transition">
                                            <p>Разрешить просмотр моих сохраненных постов</p>
                                            <Toggle
                                                checked={fields.isSavedPostsPublic}
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
                                        <Field error={errors?.currentPassword ?? null} title={"Текущий пароль"}>
                                            <InputField
                                                type="password"
                                                autoComplete="current-password"
                                                length={FIELD_LIMITS.password.max}
                                                onChange={(e) => setPasswordFields({ ...passwordFields, currentPassword: e.target.value })}
                                                onFocus={() => handleFocus('currentPassword')}
                                                placeholder="Текущий пароль"
                                                value={passwordFields.currentPassword}
                                                error={errors?.currentPassword ?? null}
                                            />
                                        </Field>
                                        <Field error={errors?.newPassword ?? null} title={"Новый пароль"}>
                                            <InputField
                                                type="password"
                                                autoComplete="new-password"
                                                length={FIELD_LIMITS.password.max}
                                                onChange={(e) => setPasswordFields({ ...passwordFields, newPassword: e.target.value })}
                                                onFocus={() => handleFocus('newPassword')}
                                                placeholder="Новый пароль"
                                                value={passwordFields.newPassword}
                                                error={errors?.newPassword ?? null}
                                            />
                                        </Field>
                                        <Field error={errors?.newPasswordConfirm ?? null} title={"Повторите новый пароль"}>
                                            <InputField
                                                type="password"
                                                autoComplete="new-password"
                                                length={FIELD_LIMITS.password.max}
                                                onChange={(e) => setPasswordFields({ ...passwordFields, newPasswordConfirm: e.target.value })}
                                                onFocus={() => handleFocus('newPasswordConfirm')}
                                                placeholder="Повторите новый пароль"
                                                value={passwordFields.newPasswordConfirm}
                                                error={errors?.newPasswordConfirm ?? null}
                                            />
                                        </Field>
                                        <div className="settings_panel_actions">
                                            <PrimaryButton type="submit" isLoading={passwordLoading}>Изменить пароль</PrimaryButton>
                                            <ActionButton type="button" disabled={passwordLoading} onClick={closePasswordForm}>Отмена</ActionButton>
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
                                <p className="kicker settings_panel_hint">Устройства, с которых выполнен вход</p>
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
                                                <DangerButton
                                                    type="button"
                                                    isLoading={endingSessionId === session._id}
                                                    disabled={Boolean(endingSessionId) || logoutLoading}
                                                    onClick={() => handleDeleteSession(session)}
                                                >
                                                    Завершить
                                                </DangerButton>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="settings_logout app-transition">
                                    <DangerButton
                                        className="logout_button"
                                        type="button"
                                        isLoading={logoutLoading}
                                        disabled={Boolean(endingSessionId)}
                                        onClick={handleLogout}
                                    >
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
