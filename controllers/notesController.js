import * as notesService from "../services/notesService.js";
import { isValidId } from "../repositories/notesRepository.js";

export const index = async (req, res) => {
  const notes = await notesService.listNotes();
  res.status(200).render("notes", { title: "Notes", notes });
};

export const create = async (req, res) => {
  const result = await notesService.createNote(req.body, req.user);
  if (!result.ok) {
    res.status(result.error.status).json({ error: result.error.message });
    return;
  }
  res.status(201).json(result.value);
};

export const destroy = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    res.status(400).json({ error: "id must be a valid id" });
    return;
  }
  const result = await notesService.deleteNote(id, req.user);
  if (!result.ok) {
    res.status(result.error.status).json({ error: result.error.message });
    return;
  }
  res.status(200).send("");
};
