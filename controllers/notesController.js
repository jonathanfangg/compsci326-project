import * as notesService from "../services/notesService.js";

export const index = async (req, res) => {
  const notes = await notesService.listNotes();
  res.status(200).render("notes", { title: "Notes", notes });
};

export const create = async (req, res) => {
  const result = await notesService.createNote(req.body);
  if (!result.ok) {
    res.status(result.error.status).json({ error: result.error.message });
    return;
  }
  res.status(201).json(result.value);
};
