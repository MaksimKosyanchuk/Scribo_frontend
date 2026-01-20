import { useState, useContext, useEffect } from 'react';
import { AppContext } from '../../App';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config';
import { Link } from 'react-router-dom';
import InputField from '../../components/InputField/index';
import "./Login.scss";
import GoogleAuthButton from '../../components/GoogleAuthButton/index';
import Register from '../Register';

const Login = () => {
    const navigate = useNavigate(); 
    const [ tokenId, setTokenId ] = useState(null)
    const [ shouldRegister, setShouldRegister ] = useState(false)
    const [ fields, setFields ] = useState(
        {
            nick_name: '',
            password: '',
        }
    )
    const [errors, setErrors] = useState({}); 
    const { showToast } = useContext(AppContext); 
   
    useEffect(() => {
        const do_login = async () => {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ google_token_id: tokenId }),
            }
            
            const login = await fetch(`${API_URL}/api/auth/google-login`, requestOptions)
            
            if(login.status === 200) {
                const result = await login.json() 
                if(result.is_registered) {
                    localStorage.setItem('token', result.data.token); 
                    navigate('/posts');
                    showToast({ message: 'Вы вошли в аккаунт!', type: 'success' }); 
                }
                else {
                    const fetch = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', "Authorization": `Baerer ${tokenId}` }
                    })

                    navigate('/register', {
                        state: {
                            email: email,
                            google_token: tokenId 
                        }
                    });
                    return
                }
            }
            const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: {
                    Authorization: `Bearer ${tokenId}`
                }
            });
            const email = (await res.json()).email;

            navigate('/auth/register', { state: { email: email, google_token: tokenId }})

            return
        } 

        if(tokenId) {
            do_login()
        }
    }, [tokenId]);

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
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nick_name: fields.nick_name, password: fields.password }),
        }
        try {
            const login = await fetch(`${API_URL}/api/auth/login`, requestOptions)
            const result = await login.json() 
            if (result.status === true) { 
                localStorage.setItem('token', result.data.token); 
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
        }
        catch (e) { 
            console.log(e)
        } 
    };
 
  return (
    <form className='form_input app-transition'>
        <InputField
            className={`user_name`}
            type="text"
            onChange={(e) => setFields({ ...fields, nick_name: e.target.value })}
            onFocus={() => handleFocus('nick_name')}
            input_label="Имя пользователя"
            placeholder="Введите имя пользователя"
            value={fields.nick_name}
            error={errors?.nick_name ?? null}
        />
        <InputField
            className={`password`}
            type="password"
            onChange={(e) => setFields({ ...fields, password: e.target.value })}
            onFocus={() => handleFocus('password')}
            input_label="Пароль"
            placeholder="Введите пароль"
            value={fields.password}
            error={errors?.password ?? null}
        />
        <button className="submit_button app-transition" onClick={handleLogin} type="button">Войти</button>
        <GoogleAuthButton setTokenId={setTokenId}/>
        <p className={"redirect_object"}>Нет акаунта?
        <Link to={"/auth/register"}>
            Зарегестрироваться.
        </Link>
        </p>
    </form>
  );
};

export default Login;
