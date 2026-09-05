import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../App';

import { emailRegister, googleRegister, veriticationEmailConfirm, verificationGoogle, loginGoogle, verificationEmail } from '../../api/auth.api';

import InputField from '../../components/Ui/InputField/index';
import DropFile from '../../components/Ui/DropFile/index';
import GoogleAuthButton from '../../components/Ui/GoogleAuthButton/index';
import PrimaryButton from '../../components/Ui/PrimaryButton';
import Field from '../../components/Ui/Field/index';
import OtpInput from '../../components/Ui/OtpInput/index';


import "../Auth/Auth.scss";

import AvatarIcon from "../../assets/svg/avatar-icon.svg?react"

const RegisterForm = ({ email = null, google_token = null, gmail_code = null }) => {
    const navigate = useNavigate();

    const [ fields, setFields ] = useState(
        {
            nick_name: '',
            password: '',
            description: '',
            avatar: null
        }
    )
    const [errors, setErrors] = useState({});
    const { showToast } = useContext(AppContext);
    const [isLoading, setIsLoading] = useState(false);

    if(!(google_token || (email && gmail_code))) {
        return <></>
    }

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
        if (fields.password.length < 8) {
            setErrors(prevErrors => ({
                ...prevErrors,
                password: "Password must be at least 8 characters long!"
            }));
            is_error = true
        }
        if (fields.password.length > 20) {
            setErrors(prevErrors => ({
                ...prevErrors,
                password: "Password cannot be longer than 20 characters!"
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

    const handleRegister = async () => {
        setIsLoading(true)
        if(!field_validation()) {
            setIsLoading(false)
            return
        }

        const formData = new FormData();
        
        for(let field in fields) {
            formData.append(field, fields[field])
        }

        formData.append("email", email)
        var result

        if(google_token) {
            formData.append("google_token", google_token)
            result = await googleRegister(formData)
        }
        else {
            formData.append("email_code", gmail_code)
            result = await emailRegister(formData)
        }

        if (result.status === true) {
            navigate("/auth/login");
            showToast({ message: "Зарегистрировано!", type: "success" });
        }
        else {
            if (result?.errors?.body) {
                const formattedErrors = Object.fromEntries(
                    Object.entries(result.errors.body).map(
                        ([field, obj]) => [field, obj.message]
                    )
                );
                setErrors(formattedErrors);
            }
            showToast({ message: "Ошибка!", type: "error" });
            setIsLoading(false)
            return result;
        }
    };

    const handleClick = () => {
        const other = { ...errors };
        delete other.avatar;

        setErrors(other);
    }

    return (
        <div className="auth_page">
            <form
                className="form_input"
                onSubmit={(e) => {
                    e.preventDefault();
                    handleRegister();
                }}
            >
                <div className="auth_page_group section app-transition">
                    <div className="auth_page_group_intro">
                        <h1>Регистрация</h1>
                    </div>
                    <div className="top_side">
                        <DropFile
                            value={fields.avatar}
                            setValue={(file) =>
                                setFields({ ...fields, avatar: file })
                            }
                            background={
                                <AvatarIcon className="drop_file_info_avatar_icon app-transition" />
                            }
                            dropFileType="image/*"
                            fileTypes="SVG, PNG, JPEG, JPG и другие"
                            errors={errors?.featured_image}
                            addNewErrors={add_errors_to_image}
                            clearErrors={clear_errors_from_image}
                            onRemove={handleClick}
                        />
                    </div>
                    <Field title="Почта">
                        <InputField
                            className={`email`}
                            type="text"
                            onChange={() => {}}
                            placeholder="Email"
                            value={email ?? fields.email}
                            error={errors?.email ?? null}
                            confirmed={Boolean(email)}
                        />
                    </Field>
                    <Field title="Имя пользователя" error={errors?.nick_name ?? null}>
                        <InputField
                            className={`user_name`}
                            type="text"
                            onChange={(e) => setFields({ ...fields, nick_name: e.target.value })}
                            onFocus={() => handleFocus('nick_name')}
                            placeholder="User Name"
                            value={fields.nick_name}
                            error={errors?.nick_name ?? null}
                        />
                    </Field>
                    <Field title="Описание" error={errors?.description ?? null}>
                        <InputField
                            className={`description`}
                            type="text"
                            isMultiline={true}
                            length={30}
                            onChange={(e) => setFields({ ...fields, description: e.target.value })}
                            onFocus={() => handleFocus('description')}
                            placeholder="Description of profile"
                            value={fields.description}
                            error={errors?.description ?? null}
                        />
                    </Field>
                </div>
                <div className="auth_page_group section app-transition">
                    <div className="auth_page_group_intro">
                        <h1>Пароль</h1>
                    </div>
                    <Field title="Пароль" error={errors?.password ?? null}>
                        <InputField
                            className={`password`}
                            type="password"
                            onChange={(e) => setFields({ ...fields, password: e.target.value })}
                            onFocus={() => handleFocus('password')}
                            placeholder="Password123"
                            value={fields.password}
                            error={errors?.password ?? null}
                        />
                    </Field>
                    <PrimaryButton type="submit" isLoading={isLoading}>
                        Зарегистрироваться
                    </PrimaryButton>
                </div>
                <p className="redirect_object">
                    Уже есть аккаунт?
                    <Link to={"/auth/login"}>Войти</Link>
                </p>
            </form>
        </div>
    );
};

const VerifyGmailCode = ({ email }) => {
    const CODE_LENGTH = 6

    const [code, setCode] = useState(Array(CODE_LENGTH).fill(""));
    const [errors, setErrors] = useState({});
    const [redigrectToForm, setRedigrectToForm] = useState(false)
    const [isLoading, setIsLoading] = useState(false);

    if (!email) return null;

    const handleSubmit = async () => {
        setIsLoading(true)
        const fullCode = code.join("");

        if (fullCode.length !== CODE_LENGTH) {
            setErrors({ code: " " });
            setIsLoading(false)
            return;
        }

        const result = await veriticationEmailConfirm(email, fullCode);
        
        setIsLoading(false)

        if(result.statusCode === 200) {
            setRedigrectToForm(true)
        }
        if(result.statusCode === 401) {
            setErrors({ "code": " " })
        }
    };

    return (
        redigrectToForm ? <RegisterForm email={email} gmail_code={code.join("")}/> :
        <div className="auth_page">
            <form
                className="form_input"
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                }}
            >
                <div className="auth_page_group section app-transition">
                    <div className="auth_page_group_intro">
                        <h1>Регистрация</h1>
                    </div>
                    <div className="otp_container">
                        <div className="otp_container_title">
                            <p>Код отправлен на</p>
                            <p className="otp_container_title_email">{email}</p>
                        </div>
                        <div className="otp_container_content">
                            <OtpInput
                                length={CODE_LENGTH}
                                value={code}
                                onChange={setCode}
                                error={errors?.code}
                                onFocus={() => setErrors({})}
                            />
                        </div>
                    </div>
                    <PrimaryButton type="submit" isLoading={isLoading}>
                        Продолжить
                    </PrimaryButton>
                </div>
            </form>
        </div> 
    );
};

const Register = () => {
    const { email, google_token, gmail_code } = useLocation().state || {};
    const navigate = useNavigate();
    
    const [ fields, setFields ] = useState({ email: '' })
    const [errors, setErrors] = useState({});
    const { showToast } = useContext(AppContext);
    const [googleToken, setGoogleToken] = useState();
    const [gmailCodeSedned, setGmailCodeSedned] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const do_login = async () => {
            const result = await verificationGoogle(googleToken)
            
            if(result.statusCode !== 200) {
                throw new Error(`Invalid google token ${result}`)
            }
            else {
                if(result.data.is_registered) {
                    const result = await loginGoogle(googleToken)
                    
                    if(result.statusCode === 200) {
                        navigate("/")
                        showToast({ message: "Вход выполнен!", type: "success" });
                    }
                }
                else {
                    navigate("/auth/register", { state: { google_token: googleToken, email: result.data.email } })
                }
            }
        } 

        if(googleToken) {
            do_login()
        }
    }, [googleToken, navigate, showToast]);


    if (google_token) {
        return <RegisterForm google_token={google_token} email={email}/>
    }

    if(email &&  gmail_code) {
        return <RegisterForm email={email} gmail_code={gmail_code}/>
    }

    const handleFocus = (fieldName) => {
        const other = { ...errors };
        delete other[fieldName];
        setErrors(other);
    };

    const field_validation = () => {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
            setErrors({
                email: "Incorrect email!"
            });
            return false
        }
        return true
    }

    const handleRegister = async () => {
        setIsLoading(true)

        if(!field_validation()) {
            setIsLoading(false)
            return
        }


        const result = await verificationEmail(fields.email)

        setIsLoading(false)

        if(result.statusCode === 200) {
            setGmailCodeSedned(true)
        }        
        if(result.statusCode === 409) {
            setErrors({
                email: result.message
            });
        }
    };

    return (
        gmailCodeSedned ? <VerifyGmailCode email={fields.email}/> : 
        <div className="auth_page">
            <form
                className="form_input"
                onSubmit={(e) => {
                    e.preventDefault();
                    handleRegister();
                }}
            >
                <div className="auth_page_group section app-transition">
                    <div className="auth_page_group_intro">
                        <h1>Регистрация</h1>
                    </div>
                    <Field title="Почта" error={errors?.email ?? null}>
                        <InputField
                            className={`email`}
                            type="text"
                            onChange={(e) => setFields({ ...fields, email: e.target.value })}
                            onFocus={() => handleFocus('email')}
                            placeholder="Email"
                            value={email ?? fields.email}
                            error={errors?.email ?? null}
                            confirmed={Boolean(email)}
                        />
                    </Field>
                    <PrimaryButton isLoading={isLoading} type="submit">
                        Продолжить
                    </PrimaryButton>
                </div>
                <p className="auth_page_or">или</p>
                <GoogleAuthButton setGoogleToken={setGoogleToken}/>
                <p className="redirect_object">
                    Уже есть аккаунт?
                    <Link to={"/auth/login"}>Войти</Link>
                </p>
            </form>
        </div>
    )
}

export default Register;
