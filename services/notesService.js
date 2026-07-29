import { Ok, Err } from "../result.js";
import {
  getAll,
  findById,
  create,
  removeById,
} from "../repositories/notesRepository.js";
import { toNoteDto } from "../dtos/noteDto.js";

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

export const createNote = async (data) => {
  const result = validateNote(data);
  if (!result.ok) return result;

  const created = await create(result.value);
  return Ok(toNoteDto(created));
};

export const deleteNote = async (id) => {
  const existing = await findById(id);
  if (!existing) return Err({ status: 404, message: "Note not found" });
  await removeById(id);
  return Ok(undefined);
};
