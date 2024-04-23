import axios from 'axios';
import { useState } from 'react';
import Modal from 'react-modal';
import CloseIcon from '@mui/icons-material/Close';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import Fab from "@mui/material/Fab";

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    transition: 'transform 0.3s ease-in-out',
  },
};

function CreateModal(props) {
    const {note, closeModal, isOpen} = props;
    const [title, setTitle] = useState(note.title);
    const [content, setContent] = useState(note.content);

    async function submitHandler(e) {
        e.preventDefault();
        const newTitle = title;
        const newContent = content;
        const {data} = await axios.put(`${import.meta.env.VITE_SERVER_API}/notes/${note._id}`,{title: newTitle, content: newContent},{withCredentials: true});
        props.showToast(data.success);
        closeModal();
    }

    return (
          <Modal
            isOpen={isOpen}
            onRequestClose={closeModal}
            style={customStyles}
            ariaHideApp={false}
          >
            <button onClick={closeModal} className='close-btn'><CloseIcon /></button>
            <h1 className='update-heading'>Update Note:</h1>
            <form className='create-note modal-form'>
                <input type="text" value={title} onChange={(e)=>{setTitle(e.target.value)}} />
                <textarea type="text" value={content} onChange={(e)=>{setContent(e.target.value)}} />
                  <Fab onClick={submitHandler}>
                    <UpgradeIcon />
                  </Fab>
            </form>
        </Modal>
    );
}

export default CreateModal;