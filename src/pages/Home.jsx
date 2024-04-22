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
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }
    
        const { data } = await axios.post(
          `${import.meta.env.VITE_SERVER_API}/verify`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (data.success === true) {
          setUsername(data.username.split("@")[0]);
          setShowNotes(true);
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Error verifying user:", error);
        navigate("/login");
      }
    }
    verifyUser();
  }, [navigate]);

  async function logout() {
    try {
      setShowNotes(false);
      localStorage.removeItem("token");
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
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
          <Backdrop
            sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={!showNotes}
          >
            <CircularProgress color="inherit" />
          </Backdrop>
        )}
      </div>
      {showNotes && <NoteArea />}
    </div>
  );
}

export default Home;