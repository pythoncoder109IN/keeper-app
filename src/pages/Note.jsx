import axios from 'axios';
import { useEffect, useState } from 'react';
import CreateModal from '../components/Modal';
import CreateArea from '../components/CreateArea';
import { Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CircularProgress from '@mui/material/CircularProgress';
import toast, { Toaster } from 'react-hot-toast';

function NoteArea () {
    const [notes, setNotes] = useState([]);
    const [modalIsOpen, setIsOpen] = useState(false);
    const [updateData, setUpdateData] = useState({});
    const [loading, setLoading] = useState(false);
    const [noteUpdated, setNoteUpdated] = useState(false);

    useEffect(() => {
        async function fetchNotes() {
            setLoading(true);
            const {data} = await axios.get(`${import.meta.env.VITE_SERVER_API}/notes`,
            {withCredentials: true});
            setNotes(data.notes);
            setLoading(false);
        }
        fetchNotes();
    }, [noteUpdated]);

    function update() {
        setNoteUpdated(!noteUpdated);
    }

    async function editHandler(id) {
        const {data} = await axios.get(`${import.meta.env.VITE_SERVER_API}/notes/${id}`,{withCredentials: true});
        setUpdateData(data.note);
        setIsOpen(true);
    }

    function closeModal() {
        setUpdateData({});
        setIsOpen(false);
    }

    function showToast(success) {
        if (success) {
            toast.success("Note Updated", {
                position: "bottom-right",
            });
        } else {
            toast.error("Error updating Note!", {
                position: "bottom-right",
            });
        }
        setNoteUpdated(!noteUpdated);
    }

    async function deleteHandler(id) {
        const {data} = await axios.delete(`${import.meta.env.VITE_SERVER_API}/notes/${id}`,{withCredentials: true});
        setNoteUpdated(!noteUpdated);
        if (data.success === true) {
            toast.success("Note Deleted", {
                position: "bottom-right",
            });
        } else {
            toast.error("Error deleting Note!", {
                position: "bottom-right",
            });
        }
    }

    return (
        <div>
            <CreateArea update={update} />
            {loading ? (<CircularProgress color='inherit'/>) :
            (notes.length === 0 ? (<p className='note'>Tap on the title to create an note.</p>) : notes.map((note, index) => {
                return (
                    <div key={index} className='note'>
                        <h1>{note.title}</h1>
                        <p>{note.content}</p>
                        <Button color="inherit" variant="contained" onClick={() => editHandler(note._id)}><EditIcon /></Button>
                        <Button color="inherit" variant="contained" onClick={() => deleteHandler(note._id)}><DeleteIcon /></Button>
                    </div>
                )
            }))}
            {modalIsOpen && <CreateModal isOpen={modalIsOpen} note={updateData} closeModal={closeModal} showToast={showToast} />}
            <Toaster />
        </div>
    )
}

export default NoteArea;