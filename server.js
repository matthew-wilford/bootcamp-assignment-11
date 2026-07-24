const express = require("express");
const path = require("path");
const crypto = require("crypto");
const { readNotes, writeNotes } = require("./db/store");

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/notes", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "notes.html"));
});

app.get("/api/notes", async (req, res) => {
  try {
    const notes = await readNotes();
    res.json(notes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Failed to read notes." });
  }
});

app.post("/api/notes", async (req, res) => {
  const { title, note, text } = req.body;
  const content = typeof text === "string" ? text : note;

  if (
    typeof title !== "string" ||
    typeof content !== "string" ||
    !title.trim() ||
    !content.trim()
  ) {
    return res.status(400).json({
      status: "error",
      message: "A title and note text are required.",
    });
  }

  try {
    const notes = await readNotes();
    const newNote = {
      id: crypto.randomUUID(),
      title: title.trim(),
      text: content.trim(),
    };

    notes.push(newNote);
    await writeNotes(notes);

    res.status(201).json(newNote);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: "Failed to save note." });
  }
});

app.delete("/api/notes/:id", async (req, res) => {
  try {
    const notes = await readNotes();
    const filteredNotes = notes.filter((note) => note.id !== req.params.id);

    if (filteredNotes.length === notes.length) {
      return res
        .status(404)
        .json({ status: "error", message: "Note not found." });
    }

    await writeNotes(filteredNotes);
    res.json({ status: "success", id: req.params.id });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ status: "error", message: "Failed to delete note." });
  }
});

app.get("", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});
