import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NoteArea from "./Note";
import Button from "@mui/material/Button";
import LogoutIcon from "@mui/icons-material/Logout";
import style from "./pages.module.css";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

function Home() {
  const navigate = useNavigate();
  const [showNotes, setShowNotes] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    async function verifyUser() {
      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER_API}/verify`,
        {},
        { withCredentials: true }
      );
      if (data.success === true) {
        setUsername(data.username.split("@")[0]);
        setShowNotes(true);
      } else {
        navigate("/login");
      }
    }
    verifyUser();
  }, [navigate]);

  function logout() {
    setShowNotes(false);
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    navigate("/login");
  }

  return (
    <div>
      <div className={style.user}>
        {username && <p className={style.welcome}>Welcome, {username}</p>}
        {showNotes ? (
          <Button
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={logout}
            className={style.btn}
          >
            Logout
          </Button>
        ) : (
          {console.log("backdrop activated");}
          <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={showNotes}
        >
          <CircularProgress color="inherit" />
        </Backdrop>)}
      </div>
      {showNotes && <NoteArea />}
    </div>
  );
}

export default Home;
