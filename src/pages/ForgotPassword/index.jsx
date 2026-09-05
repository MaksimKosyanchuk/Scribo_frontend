import { useContext, useState } from 'react';
import { AppContext } from '../../App';
import { Link, useNavigate } from 'react-router-dom';

import InputField from '../../components/Ui/InputField/index';
import PrimaryButton from '../../components/Ui/PrimaryButton';
import ActionButton from '../../components/Ui/ActionButton';
import Field from '../../components/Ui/Field/index';
import OtpInput from '../../components/Ui/OtpInput/index';

import { requestPasswordReset, confirmPasswordReset, resetPassword } from '../../api/auth.api';
import { FIELD_LIMITS } from '../../constants/fieldLimits';
import { setAccessToken } from '../../api/http';

import "../Auth/Auth.scss";

const CODE_LENGTH = 6

const ForgotPassword = () => {
    const navigate = useNavigate();
    const { showToast, setProfile } = useContext(AppContext);
    const [step, setStep] = useState("email");
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [code, setCode] = useState(Array(CODE_LENGTH).fill(""));
    const [passwords, setPasswords] = useState({
        newPassword: "",
        newPasswordConfirm: ""
    });
    const [errors, setErrors] = useState({});

    const handleFocus = (fieldName) => {
        const other = { ...errors };
        delete other[fieldName];
        setErrors(other);
    };

    const applyBodyErrors = (result) => {
        if (result?.errors?.body) {
            setErrors(Object.fromEntries(Object.entries(result.errors.body).map(([field, obj]) => [field, obj.message])));
        }
    };

    const sendCode = async () => {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            setErrors({ userEmail: "Некорректная почта" });
            return;
        }

        setIsLoading(true);
        const result = await requestPasswordReset(email.trim());
        setIsLoading(false);

        if (result?.statusCode === 429) {
            showToast({ message: "Слишком много запросов. Подождите немного.", type: "error" });
            return;
        }

        if (result?.status === true) {
            setCode(Array(CODE_LENGTH).fill(""));
            setStep("code");
            showToast({ message: "Если аккаунт существует, мы отправили код на почту", type: "success" });
            return;
        }

        applyBodyErrors(result);
        showToast({ message: "Ошибка!", type: "error" });
    };

    const confirmCode = async () => {
        const emailCode = code.join("");

        if (emailCode.length !== CODE_LENGTH) {
            setErrors({ emailCode: " " });
            return;
        }

        setIsLoading(true);
        const result = await confirmPasswordReset(email.trim(), emailCode);
        setIsLoading(false);

        if (result?.statusCode === 429) {
            showToast({ message: "Слишком много попыток. Подождите немного.", type: "error" });
            return;
        }

        if (result?.status === true) {
            setPasswords({ newPassword: "", newPasswordConfirm: "" });
            setErrors({});
            setStep("password");
            return;
        }

        setErrors({ emailCode: result?.errors?.body?.emailCode?.message || " " });
        showToast({ message: "Неверный код", type: "error" });
    };

    const submitPassword = async () => {
        const next = {};
        if (passwords.newPassword.length < FIELD_LIMITS.password.min || passwords.newPassword.length > FIELD_LIMITS.password.max) {
            next.newPassword = `Пароль должен быть от ${FIELD_LIMITS.password.min} до ${FIELD_LIMITS.password.max} символов`;
        }
        if (passwords.newPasswordConfirm.length < FIELD_LIMITS.password.min || passwords.newPasswordConfirm.length > FIELD_LIMITS.password.max) {
            next.newPasswordConfirm = `Пароль должен быть от ${FIELD_LIMITS.password.min} до ${FIELD_LIMITS.password.max} символов`;
        }
        if (!next.newPassword && !next.newPasswordConfirm && passwords.newPassword !== passwords.newPasswordConfirm) {
            next.newPasswordConfirm = "Пароли не совпадают";
        }
        if (Object.keys(next).length) {
            setErrors(next);
            return;
        }

        setIsLoading(true);
        const result = await resetPassword({
            email: email.trim(),
            emailCode: code.join(""),
            newPassword: passwords.newPassword,
            newPasswordConfirm: passwords.newPasswordConfirm
        });
        setIsLoading(false);

        if (result?.statusCode === 429) {
            showToast({ message: "Слишком много попыток. Подождите немного.", type: "error" });
            return;
        }

        if (result?.status === true) {
            setAccessToken(null);
            setProfile(null);
            showToast({ message: "Пароль изменён. Войдите с новым паролем.", type: "success" });
            navigate("/auth/login");
            return;
        }

        applyBodyErrors(result);
        showToast({ message: "Ошибка!", type: "error" });
    };

    return (
        <div className="auth_page">
            {step === "email" ? (
                <form
                    className="form_input"
                    onSubmit={(event) => {
                        event.preventDefault();
                        sendCode();
                    }}
                >
                    <div className="auth_page_stack">
                    <h1 className="auth_page_title">Сброс пароля</h1>
                    <div className="auth_page_group section app-transition">
                        <Field title="Почта" error={errors?.userEmail ?? null}>
                            <InputField
                                type="email"
                                autoComplete="email"
                                onChange={(e) => setEmail(e.target.value)}
                                onFocus={() => handleFocus("userEmail")}
                                placeholder="Email"
                                value={email}
                                error={errors?.userEmail ?? null}
                                length={FIELD_LIMITS.email.max}
                            />
                        </Field>
                        <PrimaryButton type="submit" isLoading={isLoading}>Отправить код</PrimaryButton>
                    </div>
                    </div>
                    <p className="redirect_object">
                        Вспомнили пароль?
                        <Link to="/auth/login">Войти</Link>
                    </p>
                </form>
            ) : null}

            {step === "code" ? (
                <form
                    className="form_input"
                    onSubmit={(event) => {
                        event.preventDefault();
                        confirmCode();
                    }}
                >
                    <div className="auth_page_stack">
                    <h1 className="auth_page_title">Код из письма</h1>
                    <div className="auth_page_group section app-transition">
                        <div className="otp_container">
                            <div className="otp_container_content">
                                <OtpInput
                                    length={CODE_LENGTH}
                                    value={code}
                                    onChange={setCode}
                                    error={errors?.emailCode}
                                    onFocus={() => handleFocus("emailCode")}
                                />
                            </div>
                        </div>
                        <PrimaryButton type="submit" isLoading={isLoading}>Продолжить</PrimaryButton>
                        <ActionButton
                            type="button"
                            onClick={sendCode}
                            disabled={isLoading}
                        >
                            Отправить код ещё раз
                        </ActionButton>
                    </div>
                    </div>
                    <p className="redirect_object">
                        <button type="button" className="auth_text_button" onClick={() => setStep("email")}>
                            Изменить почту
                        </button>
                    </p>
                </form>
            ) : null}

            {step === "password" ? (
                <form
                    className="form_input"
                    onSubmit={(event) => {
                        event.preventDefault();
                        submitPassword();
                    }}
                >
                    <div className="auth_page_stack">
                    <h1 className="auth_page_title">Новый пароль</h1>
                    <div className="auth_page_group section app-transition">
                        <Field title="Новый пароль" error={errors?.newPassword ?? null}>
                            <InputField
                                type="password"
                                autoComplete="new-password"
                                length={FIELD_LIMITS.password.max}
                                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                onFocus={() => handleFocus("newPassword")}
                                placeholder="Новый пароль"
                                value={passwords.newPassword}
                                error={errors?.newPassword ?? null}
                            />
                        </Field>
                        <Field title="Повторите пароль" error={errors?.newPasswordConfirm ?? null}>
                            <InputField
                                type="password"
                                autoComplete="new-password"
                                length={FIELD_LIMITS.password.max}
                                onChange={(e) => setPasswords({ ...passwords, newPasswordConfirm: e.target.value })}
                                onFocus={() => handleFocus("newPasswordConfirm")}
                                placeholder="Повторите пароль"
                                value={passwords.newPasswordConfirm}
                                error={errors?.newPasswordConfirm ?? null}
                            />
                        </Field>
                        <PrimaryButton type="submit" isLoading={isLoading}>Сменить пароль</PrimaryButton>
                    </div>
                    </div>
                    <p className="redirect_object">
                        <Link to="/auth/login">Вернуться ко входу</Link>
                    </p>
                </form>
            ) : null}
        </div>
    );
};

export default ForgotPassword;
