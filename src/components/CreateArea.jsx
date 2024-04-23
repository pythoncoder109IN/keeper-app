import { useRef, useState } from "react";
import AddIcon from '@mui/icons-material/Add';
import Fab from "@mui/material/Fab";
import Zoom from "@mui/material/Zoom";
import axios from "axios";
import toast, { Toaster } from 'react-hot-toast';
import CircularProgress from '@mui/material/CircularProgress';

function CreateArea(props) {
    const [isExpanded, setExpanded] = useState(false);
    const [creatingNote, setCreatingNote] = useState(false);
    const titleRef = useRef();
    const contentRef = useRef();  

    async function submitNote(event) {
        event.preventDefault();
        setCreatingNote(true);
        const title = titleRef.current.value;
        const content = contentRef.current.value;
        const {data} = await axios.post(`${import.meta.env.VITE_SERVER_API}/notes`,{title: title, content: content},{withCredentials: true});
        // console.log(data);
        props.update()
        if (data.success === true) {
            toast.success("Note Created", {
                position: "bottom-right",
            });
        } else {
            toast.error("Error creating Note!", {
                position: "bottom-right",
            });
        }
        setCreatingNote(false);
        titleRef.current.value = '';
        contentRef.current.value = '';
    }

    function expand() {
        setExpanded(true);
    }

    return (
        <div>
        <form className="create-note">
            <input
                name="title"
                ref={titleRef}
                placeholder="Title"
                onClick={expand}
            />
            {isExpanded && ( 
                <textarea
                    name="content"
                    ref={contentRef}
                    placeholder="Take a note..."
                    rows={isExpanded ? 3 : 1}
                />
            )}
            <Zoom in={isExpanded}>
                <Fab onClick={submitNote}>
                    {creatingNote ? <CircularProgress color="inherit"/> : <AddIcon />}
                </Fab>
            </Zoom>
        </form>
        <Toaster/>
        </div>
    );
}

export default CreateArea;
