import { useContext, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { AppContext } from "../../App";
import { createSupportRequest } from "../../api/support.api";
import { SUPPORT_KINDS } from "./constants";

import Field from "../../components/Ui/Field/index";
import InputField from "../../components/Ui/InputField/index";
import DropDown from "../../components/Ui/DropDown";
import PrimaryButton from "../../components/Ui/PrimaryButton";

import "./Support.scss";

const Support = () => {
    const navigate = useNavigate();
    const { showToast, profile, profileLoading } = useContext(AppContext);
    const [isLoading, setIsLoading] = useState(false);
    const [fields, setFields] = useState({
        email: "",
        kind: "request",
        message: ""
    });
    const [errors, setErrors] = useState({});

    const handleFocus = (fieldName) => {
        const next = { ...errors };
        delete next[fieldName];
        setErrors(next);
    };

    const validate = () => {
        const next = {};

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
            next.email = "Укажите корректную почту";
        }

        if (!fields.kind) {
            next.kind = "Выберите тип обращения";
        }

        if (!fields.message.trim()) {
            next.message = "Напишите сообщение";
        }

        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) {
            return;
        }

        setIsLoading(true);
        try {
            const result = await createSupportRequest({
                email: fields.email.trim(),
                kind: fields.kind,
                message: fields.message.trim()
            });

            if (result.status === true && result.data?.access_key) {
                showToast({ message: "Запрос отправлен. Мы напишем на указанную почту.", type: "success" });
                navigate(`/support/${result.data.access_key}`);
                return;
            }

            showToast({ message: result.message || "Не удалось отправить запрос", type: "error" });

            if (result?.errors?.body) {
                setErrors(
                    Object.fromEntries(
                        Object.entries(result.errors.body).map(([field, obj]) => [field, obj.message])
                    )
                );
            }
        }
        catch {
            showToast({ message: "Не удалось отправить запрос", type: "error" });
        }
        finally {
            setIsLoading(false);
        }
    };

    if (!profileLoading && profile) {
        return <Navigate to="/support/mine" replace />;
    }

    return (
        <div className="support_page">
            <div className="support_page_intro">
                <h1>Поддержка</h1>
                <p>Оставьте почту и сообщение. Ответ придёт письмом. Ответить с этой страницы нельзя.</p>
            </div>
            <form
                className="form_input app-transition"
                onSubmit={(event) => {
                    event.preventDefault();
                    handleSubmit();
                }}
            >
                <Field title="Почта" error={errors?.email ?? null}>
                    <InputField
                        type="email"
                        value={fields.email}
                        placeholder="you@example.com"
                        onChange={(event) => setFields({ ...fields, email: event.target.value })}
                        onFocus={() => handleFocus("email")}
                        error={errors?.email ?? null}
                        length={120}
                    />
                </Field>
                <Field title="Тип" error={errors?.kind ?? null}>
                    <DropDown
                        options={SUPPORT_KINDS}
                        value={fields.kind}
                        placeholder="Тип обращения"
                        error={Boolean(errors?.kind)}
                        onChange={(value) => {
                            handleFocus("kind");
                            setFields({ ...fields, kind: value });
                        }}
                    />
                </Field>
                <Field title="Сообщение" error={errors?.message ?? null}>
                    <InputField
                        isMultiline={true}
                        multilineRows={8}
                        length={2000}
                        value={fields.message}
                        placeholder="Опишите ситуацию"
                        onChange={(event) => setFields({ ...fields, message: event.target.value })}
                        onFocus={() => handleFocus("message")}
                        error={errors?.message ?? null}
                    />
                </Field>
                <PrimaryButton type="submit" isLoading={isLoading}>
                    Отправить
                </PrimaryButton>
                <p className="support_page_note">
                    Если <Link to="/auth/login">войти в аккаунт</Link>, ответы придут на сайте, и вы сможете писать в переписку сами.
                </p>
            </form>
        </div>
    );
};

export default Support;
