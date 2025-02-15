import React, { useState, useEffect } from "react";
import axios from "axios";
import "./log.css";

const Log = ({ onNotesUpdate }) => {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [isAdding, setIsAdding] = useState(false);

  // ✅ Load notes from session storage when component mounts
  useEffect(() => {
    const storedNotes = sessionStorage.getItem("logs");
    if (storedNotes) {
      setNotes(JSON.parse(storedNotes));
    }
  }, []);

  // ✅ Save notes to session storage whenever notes change
  useEffect(() => {
    sessionStorage.setItem("logs", JSON.stringify(notes));
  }, [notes]);

  // Open new note form
  const handleAddNewNote = () => {
    setNewNote({ title: "", content: "" });
    setIsAdding(true);
    setSelectedNote(null);
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewNote((prevNote) => ({
      ...prevNote,
      [name]: value,
    }));
  };

  // Function to send text to the FastAPI server and get sentiment analysis
  const analyzeSentiment = async (text) => {
    try {
      const response = await axios.post("http://localhost:5000/predict", { text });
      return response.data.sentiment; // Returns 0 (Negative) or 1 (Positive)
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
      return null;
    }
  };

  // Submit new note
  const handleSubmit = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return;

    const sentiment = await analyzeSentiment(newNote.content); // Get sentiment analysis

    if (sentiment === null) {
      alert("Error in sentiment analysis. Try again.");
      return;
    }

    const newEntry = {
      title: newNote.title,
      content: newNote.content,
      sentiment: sentiment, // Store sentiment result (0 or 1)
      date: new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }),
    };

    const updatedNotes = [newEntry, ...notes];
    setNotes(updatedNotes);
    setNewNote({ title: "", content: "" });
    setIsAdding(false);
    setSelectedNote(newEntry);

    // ✅ Save to session storage
    sessionStorage.setItem("logs", JSON.stringify(updatedNotes));

    // ✅ Update Home page with new notes if function exists
    if (onNotesUpdate) {
      onNotesUpdate(updatedNotes);
    }
  };

  return (
    <div className="journal-container">
      <div className="sidebar">
        <button className="add-note-btn" onClick={handleAddNewNote}>Add New Note</button>
        {notes.length === 0 ? (
          <p>No notes available. Add a new note!</p>
        ) : (
          <ul className="note-list">
            {notes.map((note, index) => (
              <li
                key={index}
                className={`note-item ${selectedNote === note ? "active" : ""}`}
                onClick={() => setSelectedNote(note)}
              >
                <h3>{note.title}</h3>
                <p className="note-date">{note.date}</p>
                <p className="note-content">
                  {note.content.length > 30 ? note.content.substring(0, 30) + "..." : note.content}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="note-content-area">
        {isAdding ? (
          <div className="new-note-form">
            <input
              type="text"
              name="title"
              placeholder="Enter note title..."
              value={newNote.title}
              onChange={handleInputChange}
              required
            />
            <textarea
              name="content"
              placeholder="Write your journal entry here..."
              value={newNote.content}
              onChange={handleInputChange}
              required
            />
            <button className="submit-btn" onClick={handleSubmit}>Submit</button>
          </div>
        ) : selectedNote ? (
          <>
            <h2>{selectedNote.title}</h2>
            <textarea className="note-textarea" value={selectedNote.content} readOnly />
          </>
        ) : (
          <h2>Select a note or create a new one</h2>
        )}
      </div>
    </div>
  );
};

export default Log;
