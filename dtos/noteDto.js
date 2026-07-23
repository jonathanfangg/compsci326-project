export const toNoteDto = (note) => ({
  query: note.query,
  text: note.text,
  searchUrl: note.searchUrl,
});
