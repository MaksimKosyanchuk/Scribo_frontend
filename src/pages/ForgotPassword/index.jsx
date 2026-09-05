import { useContext, useState } from 'react';
import { AppContext } from '../../App';
import { Link, useNavigate } from 'react-router-dom';

import InputField from '../../components/Ui/InputField/index';
import PrimaryButton from '../../components/Ui/PrimaryButton';
import ActionButton from '../../components/Ui/ActionButton';
import Field from '../../components/Ui/Field/index';
import OtpInput from '../../components/Ui/OtpInput/index';

import { requestPasswordReset, confirmPasswordReset, resetPassword } from '../../api/auth.api';
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
        new_password: "",
        new_password_confirm: ""
    });
    const [errors, setErrors] = useState({});

    const handleFocus = (fieldName) => {
        const other = { ...errors };
        delete other[fieldName];
        setErrors(other);
    };

    const applyBodyErrors = (result) => {
        if (result?.errors?.body) {
            setErrors(Object.fromEntries(
                Object.entries(result.errors.body).map(
                    ([field, obj]) => [field, obj.message]
                )
            ));
        }
    };

    const sendCode = async () => {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            setErrors({ email: "Некорректная почта" });
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
        const email_code = code.join("");

        if (email_code.length !== CODE_LENGTH) {
            setErrors({ email_code: " " });
            return;
        }

        setIsLoading(true);
        const result = await confirmPasswordReset(email.trim(), email_code);
        setIsLoading(false);

        if (result?.statusCode === 429) {
            showToast({ message: "Слишком много попыток. Подождите немного.", type: "error" });
            return;
        }

        if (result?.status === true) {
            setPasswords({ new_password: "", new_password_confirm: "" });
            setErrors({});
            setStep("password");
            return;
        }

        setErrors({ email_code: result?.errors?.body?.email_code?.message || " " });
        showToast({ message: "Неверный код", type: "error" });
    };

    const submitPassword = async () => {
        const next = {};
        if (passwords.new_password.length < 8 || passwords.new_password.length > 20) {
            next.new_password = "Пароль должен быть от 8 до 20 символов";
        }
        if (passwords.new_password_confirm.length < 8 || passwords.new_password_confirm.length > 20) {
            next.new_password_confirm = "Пароль должен быть от 8 до 20 символов";
        }
        if (!next.new_password && !next.new_password_confirm && passwords.new_password !== passwords.new_password_confirm) {
            next.new_password_confirm = "Пароли не совпадают";
        }
        if (Object.keys(next).length) {
            setErrors(next);
            return;
        }

        setIsLoading(true);
        const result = await resetPassword({
            email: email.trim(),
            email_code: code.join(""),
            new_password: passwords.new_password,
            new_password_confirm: passwords.new_password_confirm
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
                        <Field title="Почта" error={errors?.email ?? null}>
                            <InputField
                                type="email"
                                autoComplete="email"
                                onChange={(e) => setEmail(e.target.value)}
                                onFocus={() => handleFocus("email")}
                                placeholder="Email"
                                value={email}
                                error={errors?.email ?? null}
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
                                    error={errors?.email_code}
                                    onFocus={() => handleFocus("email_code")}
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
                        <Field title="Новый пароль" error={errors?.new_password ?? null}>
                            <InputField
                                type="password"
                                autoComplete="new-password"
                                length={20}
                                onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
                                onFocus={() => handleFocus("new_password")}
                                placeholder="Новый пароль"
                                value={passwords.new_password}
                                error={errors?.new_password ?? null}
                            />
                        </Field>
                        <Field title="Повторите пароль" error={errors?.new_password_confirm ?? null}>
                            <InputField
                                type="password"
                                autoComplete="new-password"
                                length={20}
                                onChange={(e) => setPasswords({ ...passwords, new_password_confirm: e.target.value })}
                                onFocus={() => handleFocus("new_password_confirm")}
                                placeholder="Повторите пароль"
                                value={passwords.new_password_confirm}
                                error={errors?.new_password_confirm ?? null}
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
