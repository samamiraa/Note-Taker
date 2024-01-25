const express = require('express');
const path = require('path');
const fs = require('fs');
let notes = require('./db/db.json')
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, 'public/index.html'))
);

app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, 'public/notes.html'))
);

app.get('/api/notes', (req, res) => {
  console.info(`${req.method} request received to get notes`);
  return res.json(notes);
});

app.get('*', (req, res) => 
  res.sendFile(path.join(__dirname, 'public/index.html'))
);

app.get('/api/notes/:id', (req, res) => {
  const noteId = req.params.id;
  const activeNote = notes.find(note => note.id === noteId);

  if (activeNote) {
    res.json(activeNote);
  } else {
    res.status(404).json('Note not found');
  };
});

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

function uuid() {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
};

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

app.listen (PORT, () =>
console.log(`App listening at http://localhost:${PORT}`)
);