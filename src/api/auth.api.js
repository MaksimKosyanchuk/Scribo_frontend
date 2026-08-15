import { API_URL } from "../config";

const verificationGoogle = async (token) => {
    try {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ google_token: token }),
        }
    
        const response = await fetch(`${API_URL}/api/auth/verification/google`, requestOptions)
        const result = await response.json()
        const code = response.status
    
        return {
            statusCode: code,
            ...result
        }
    }
    catch(err) {
        console.log(err)
    }
}

const loginGoogle = async (token) => {
    try {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ google_token: token }),
        }
        
        const response = await fetch(`${API_URL}/api/auth/login/google`, requestOptions)
        const code = response.status
        const result = await response.json()

        return {
            statusCode: code,
            ...result
        }

    }
    catch(err) {
        console.log(err)
    }
}

const loginUsername = async (username, password) => {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_name: username, password: password }),
    }
    const response = await fetch(`${API_URL}/api/auth/login/username`, requestOptions)
    const code = response.status
    const result = await response.json()

    return {
        statusCode: code,
        ...result
    }
}

const emailRegister = async (data) => {
    const response = await fetch(`${API_URL}/api/auth/register/email`, { method: "POST", body: data })

    const code = response.status
    const result = await response.json()

    return {
        statusCode: code,
        ...result
    }
}

const googleRegister = async (data) => {
    const response = await fetch(`${API_URL}/api/auth/register/google`, { method: "POST", body: data })

    const code = response.status
    const result = await response.json()

    return {
        statusCode: code,
        ...result
    }
}

const veriticationEmailConfirm = async (email, fullCode) => {
    try {
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                email_code: fullCode,
            })
        }
        
        const response = await fetch(`${API_URL}/api/auth/verification/email/confirm`, requestOptions)
    
        const code = response.status
        const result = await response.json()
    
        return {
            statusCode: code,
            ...result
        }
    }
    catch(error) {
        console.log(error)
    }
}

const verificationEmail = async (email) => {
    try {
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email
            })
        }

        const response = await fetch(`${API_URL}/api/auth/verification/email`, requestOptions)

        const code = response.status
        const result = await response.json()

        return {
            statusCode: code,
            ...result
        }
    }
    catch(error) {
        console.log(error)
    }
}

export {
    verificationGoogle,
    loginGoogle,
    loginUsername,
    emailRegister,
    googleRegister,
    veriticationEmailConfirm,
    verificationEmail
}