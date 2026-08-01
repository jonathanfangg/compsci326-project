export const toNoteDto = (note) => ({
  id: note._id.toString(),
  query: note.query,
  text: note.text,
  searchUrl: note.searchUrl,
});
