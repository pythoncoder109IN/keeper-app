import axios from "axios";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button, TextField, createTheme } from "@mui/material";
import style from "./pages.module.css"
import LoginIcon from '@mui/icons-material/Login';
import { ThemeProvider } from "@emotion/react";
import toast, { Toaster } from 'react-hot-toast';

const theme = createTheme({
    palette: {
      yellow: {
        main: '#f5ba13',
        light: '#ffff45',
        dark: '#c38900',
        contrastText: '#fff',
      },
    },
});

function Login() {
    const emailRef = useRef();
    const passwordRef = useRef();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        const email = emailRef.current.value;
        const password = passwordRef.current.value;
        const toastId = toast.loading('Logging you in...');
        try {
            const { data } = await axios.post(
                `${import.meta.env.VITE_SERVER_API}/login`,
                { email, password },
                { withCredentials: true }
            );

            toast.dismiss(toastId);
            if (data.success === true) {
                localStorage.setItem("token", data.token);
                toast.success("Logged In!", {
                    position: "bottom-right",
                });
                setTimeout(() => {    
                    navigate('/');
                }, 1000);
            } else {
                toast.error("Incorrect email or password!", {
                    position: "bottom-right",
                });
            }
        } catch (error) {
            toast.dismiss(toastId);
            console.log("Login error:", error);
            toast.error("Something went wrong!", {
                position: "bottom-right",
            });
        }
    }

    function signup() {
        navigate('/signup');
    }

    return (
        <ThemeProvider theme={theme}>
            <div className={style.login}>
                <form onSubmit={handleSubmit} className={style.form}>
                    <h1>Login</h1>
                    <TextField color="yellow" type="email" inputRef={emailRef} label="Email" variant="outlined" required/>
                    <TextField color="yellow" type="password" inputRef={passwordRef} label="Password" variant="outlined" required/>
                    <Button color="yellow" variant="outlined" type="submit" startIcon={<LoginIcon />} className={style.loginBtn}>Login</Button>
                    <Button color="yellow" variant="contained" className={style.signupBtn} onClick={signup}>Signup</Button>
                </form>
                <Toaster />
            </div>
        </ThemeProvider>
    )
}

export default Login;
