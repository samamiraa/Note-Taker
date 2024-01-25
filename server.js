//! dependancies
const express = require('express');
const path = require('path');
const fs = require('fs');

//!import db.json
let notes = require('./db/db.json')
const app = express();
//!port for server
const PORT = process.env.PORT || 3001;

//! middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

//! root route to index.html
app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, 'public/index.html'))
);

//! route to notes html
app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, 'public/notes.html'))
);

//! get request to get existing notes from json file
app.get('/api/notes', (req, res) => {
  console.info(`${req.method} request received to get notes`);
  return res.json(notes);
});

//! Fallback route for when a user attempts to visit routes that don't exist
app.get('*', (req, res) => 
  res.sendFile(path.join(__dirname, 'public/index.html'))
);

//! get request for active note to display in text area
app.get('/api/notes/:id', (req, res) => {
  const noteId = req.params.id;
  const activeNote = notes.find(note => note.id === noteId);

  if (activeNote) {
    res.json(activeNote);
  } else {
    res.status(404).json('Note not found');
  };
});

//! delete request for specific note to be deleted, then filters in notes to keep & rewrites json file
app.delete('/api/notes/:id', (req, res) => {
  const noteId = req.params.id;
  notes = notes.filter(note => note.id !== noteId);

  const noteString = JSON.stringify(notes, null, 2);

  fs.writeFile('./db/db.json', noteString, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json('Error in deleting note');
     } else {
      console.log(`Note has been deleted`);
      return res.status(200).json(notes);
     }
  });

});

//! function to create random id for note
function uuid() {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
};

//! post request to create new note then push to array and rewrite json file with new note added
app.post('/api/notes', (req, res) => {
  console.info(`${req.method} request recieved to add a new note`);

  const {title, text} = req.body;

  if (title && text) {
    const newNote = {
      title,
      text,
      id: uuid(),
    };

    notes.push(newNote);

    const noteString = JSON.stringify(notes, null, 2);

    fs.writeFile('./db/db.json', noteString, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json('Error in posting note');
       } else {
        console.log(`Note for ${newNote.title} has been written to JSON file`);

        const response = {
          status:'succuess', 
          body: newNote,
        };

        console.log(response);
        return res.status(201).json(response);
      };
    });
  } else {
    return res.status(400).json('Title and text are required for a new note');
  };
});

//! listens for connections
app.listen (PORT, () =>
console.log(`App listening at http://localhost:${PORT}`)
);