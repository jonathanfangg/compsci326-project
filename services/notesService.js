import { Ok, Err } from "../result.js";
import {
  getAll,
  findById,
  create,
  removeById,
} from "../repositories/notesRepository.js";
import { toNoteDto } from "../dtos/noteDto.js";
import * as usersRepository from "../repositories/usersRepository.js";

const SEARCH_URL = "https://www.google.com/search?q=";

const buildSearchUrl = (query) =>
  SEARCH_URL + encodeURIComponent(`${query} -ai-none`);

const validateNote = ({ query, text } = {}) => {
  const trimmedQuery = (query || "").trim();
  const trimmedText = (text || "").trim();
  if (!trimmedQuery || !trimmedText) {
    return Err({ status: 400, message: "query and text are required" });
  }
  return Ok({
    query: trimmedQuery,
    text: trimmedText,
    searchUrl: buildSearchUrl(trimmedQuery),
  });
};

export const searchFor = (query) => {
  const trimmedQuery = (query || "").trim();
  if (!trimmedQuery) {
    return Err({ status: 400, message: "a search query is required" });
  }
  return Ok(buildSearchUrl(trimmedQuery));
};

export const listNotes = async () => {
  const notes = await getAll();
  return notes.map(toNoteDto);
};

export const createNote = async (data, actor) => {
  const result = validateNote(data);
  if (!result.ok) return result;

  const created = await create({ ...result.value, ownerId: actor.id });
  return Ok(toNoteDto(created));
};

const isOwnerOrAdmin = async (note, actorId) => {
  if (note.ownerId.toString() === actorId) return true;
  const account = await usersRepository.findById(actorId);
  return account?.role === "admin";
};

export const deleteNote = async (id, actor) => {
  const existing = await findById(id);
  if (!existing) return Err({ status: 404, message: "Note not found" });

  const allowed = await isOwnerOrAdmin(existing, actor.id);
  if (!allowed) {
    return Err({
      status: 403,
      message: "you do not have permission to delete this note",
    });
  }

  await removeById(id);
  return Ok(undefined);
};
