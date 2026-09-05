import { useState, useContext, useEffect } from 'react';
import { AppContext } from '../../App';
import { useNavigate, Link } from 'react-router-dom';

import InputField from '../../components/Ui/InputField/index';
import PrimaryButton from '../../components/Ui/PrimaryButton';
import Field from '../../components/Ui/Field/index';

import { verificationGoogle, loginGoogle, loginUsername } from '../../api/auth.api';

import "../Auth/Auth.scss";

import GoogleAuthButton from '../../components/Ui/GoogleAuthButton/index';

const Login = () => {
    const navigate = useNavigate(); 
    const [ googleToken, setGoogleToken ] = useState(null)
    const [ isLoading, setIsLoading ] = useState(false)
    const [ fields, setFields ] = useState(
        {
            user_login: '',
            password: '',
        }
    )
    const [errors, setErrors] = useState({}); 
    const { showToast } = useContext(AppContext); 
   
    useEffect(() => {
        const do_login = async () => {

            setIsLoading(true)
            const result = await verificationGoogle(googleToken)

            if(result.status === true) {
                if(result.data.is_registered === true) {
                    await loginGoogle(googleToken)

                    setIsLoading(false)
                    navigate('/posts');
                    showToast({ message: 'Вы вошли в аккаунт!', type: 'success' }); 
                }
                else {
                    navigate('/auth/register', { state: { google_token: googleToken, email: result.data.email } });
                }
            }
            else {
                throw new Error(`Invalid google token ${result}`)
            }
        }

        if(googleToken) {
            do_login()
        }
    }, [googleToken, navigate, showToast]);

    const handleFocus = (fieldName) => {
        const other = { ...errors };
        delete other[fieldName];
        setErrors(other);
    };

    const field_validation = () => {
        let is_error = false
        if (fields.user_login.length < 3) {
            setErrors(prevErrors => ({
                ...prevErrors,
                user_login: "User login must be at least 3 characters long!"
            }));
            is_error = true
        }
        if (fields.user_login.length > 60) {
            setErrors(prevErrors => ({
                ...prevErrors,
                user_login: "User login cannot be longer than 60 characters!"
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
        return !is_error
    }

    const handleLogin = async () => {
        if(!field_validation()) {
            return
        }
        
        setIsLoading(true)
        const result = await loginUsername(fields.user_login, fields.password)
        setIsLoading(false)
        
        if (result.status === true) { 
            navigate('/posts');
            showToast({ message: 'Вы вошли в аккаунт!', type: 'success' }); 
            return result; 
        } 
        else { 
            showToast({ message: 'Неверно!', type: 'error' }); 
            if (result?.errors?.body) {
                const formattedErrors = Object.fromEntries(
                    Object.entries(result.errors.body).map(
                        ([field, obj]) => [field, obj.message]
                    )
                );

                setErrors(formattedErrors);
            }
    
            return result; 
        }
    };
 
  return (
    <div className="auth_page">
        <form className="form_input" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
            <div className="auth_page_stack">
                <h1 className="auth_page_title">Вход</h1>
                <div className="auth_page_group section app-transition">
                    <Field title="Логин" error={errors?.user_login ?? null}>
                        <InputField
                            className={`user_login`}
                            type="text"
                            onChange={(e) => setFields({ ...fields, user_login: e.target.value })}
                            onFocus={() => handleFocus('user_login')}
                            placeholder="Имя пользователя или email"
                            value={fields.user_login}
                            error={errors?.user_login ?? null}
                        />
                    </Field>
                    <Field title="Пароль" error={errors?.password ?? null}>
                        <InputField
                            className={`password`}
                            type="password"
                            onChange={(e) => setFields({ ...fields, password: e.target.value })}
                            onFocus={() => handleFocus('password')}
                            placeholder="Введите пароль"
                            value={fields.password}
                            error={errors?.password ?? null}
                        />
                    </Field>
                    <div className="auth_page_forgot">
                        <Link to="/auth/forgot-password">Забыли пароль?</Link>
                    </div>
                    <PrimaryButton type="submit" isLoading={isLoading}>Войти</PrimaryButton>
                </div>
            </div>
            <p className="auth_page_or">или</p>
            <GoogleAuthButton setGoogleToken={setGoogleToken}/>
            <p className="redirect_object">
                Нет аккаунта?
                <Link to={"/auth/register"}>Зарегистрироваться</Link>
            </p>
        </form>
    </div>
  );
};

export default Login;
