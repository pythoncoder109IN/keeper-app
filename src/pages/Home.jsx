import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import NoteArea from './Note';
import Button from '@mui/material/Button';
import LogoutIcon from '@mui/icons-material/Logout';
import style from './pages.module.css'

function Home() {
    const navigate = useNavigate();
    const [cookies, removeCookie] = useCookies(['token']);
    const [showNotes, setShowNotes] = useState(false);
    const [username, setUsername] = useState('');

    useEffect(() => {
        async function verifyCookie() {
            console.log(cookies);
            if (!cookies.token) {
                console.log(cookies.token);
                navigate('/login');
            } else {
                const {data} = await axios.post(`${import.meta.env.VITE_SERVER_API}/verify`,
                {},
                {withCredentials: true});
                console.log(data);
                if (data.success === true) {
                    setUsername(data.username.split('@')[0]);
                    setShowNotes(true);
                } else {
                    removeCookie('token');
                    navigate('/login');
                }
            }
        }
        verifyCookie();
    }, [cookies.token, removeCookie, navigate]);

    function logout() {
        setShowNotes(false);
        removeCookie('token');
        navigate('/login');
    }

    return (
        <div>
            <div className={style.user}>
                {username && <p className={style.welcome}>Welcome, {username}</p>}
                <Button variant="outlined" startIcon={<LogoutIcon />} onClick={logout} className={style.btn}>Logout</Button>
            </div>
            {showNotes && <NoteArea />}
        </div>
    )
}

export default Home
