const express = require('express');
const path = require('path');
const fs = require('fs');
const notes = require('./db/db.json')
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

function uuid() {
  Math.floor((1 + Math.random()) * 0x10000)
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
      noteId: uuid(),
    };

    const noteString = JSON.stringify(newNote);

    fs.writeFile(notes, noteString, (err) =>
      err
      ? console.error(err)
      : console.log(
          `Note for ${newNote.title} has been written to JSON file`
        )
    );
  };
});

app.listen (PORT, () =>
console.log(`App listening at http://localhost:${PORT}`)
);