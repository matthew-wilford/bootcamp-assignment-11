const fs = require("fs/promises");
const path = require("path");

const dbPath = path.join(__dirname, "db.json");

async function readNotes() {
  try {
    const data = await fs.readFile(dbPath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    if (err.code === "ENOENT") {
      await fs.writeFile(dbPath, "[]", "utf8");
      return [];
    }
    throw err;
  }
}

async function writeNotes(notes) {
  await fs.writeFile(dbPath, JSON.stringify(notes, null, 2), "utf8");
}

module.exports = {
  readNotes,
  writeNotes,
};
