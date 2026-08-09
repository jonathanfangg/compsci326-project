import { jest } from "@jest/globals";

jest.unstable_mockModule("../repositories/notesRepository.js", () => ({
  getAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn((data) => ({ _id: "fake-id", ...data })),
  removeById: jest.fn(),
}));

jest.unstable_mockModule("../repositories/usersRepository.js", () => ({
  findById: jest.fn(),
}));

const { createNote, deleteNote, listNotes, searchFor } =
  await import("../services/notesService.js");
const { getAll, findById, create, removeById } =
  await import("../repositories/notesRepository.js");

test("createNote rejects a missing query", async () => {
  const result = await createNote({
    query: "",
    text: "The moon pulls water toward it.",
  });
  expect(result.ok).toBe(false);
  expect(result.error).toEqual({
    status: 400,
    message: "query and text are required",
  });
});

test("createNote rejects a missing text", async () => {
  const result = await createNote({ query: "how do tides work", text: "" });
  expect(result.ok).toBe(false);
  expect(result.error).toEqual({
    status: 400,
    message: "query and text are required",
  });
});

test("createNote rejects a query and text that are only spaces", async () => {
  const result = await createNote({ query: "   ", text: "   " });
  expect(result.ok).toBe(false);
  expect(result.error).toEqual({
    status: 400,
    message: "query and text are required",
  });
});

test("createNote rejects a request that has no body at all", async () => {
  const result = await createNote(undefined);
  expect(result.ok).toBe(false);
  expect(result.error).toEqual({
    status: 400,
    message: "query and text are required",
  });
});

test("createNote saves a valid note and returns its DTO", async () => {
  const result = await createNote(
    {
      query: "how do tides work",
      text: "The moon pulls water toward it.",
    },
    { id: "alice-id" },
  );
  expect(result.ok).toBe(true);
  expect(result.value).toEqual({
    id: "fake-id",
    query: "how do tides work",
    text: "The moon pulls water toward it.",
    searchUrl:
      "https://www.google.com/search?q=how%20do%20tides%20work%20-ai-none",
  });
});

test("createNote stores the actor's id as ownerId", async () => {
  await createNote(
    { query: "how do tides work", text: "The moon pulls water toward it." },
    { id: "alice-id" },
  );
  expect(create).toHaveBeenCalledWith(
    expect.objectContaining({ ownerId: "alice-id" }),
  );
});

test("createNote trims the query and the text before saving", async () => {
  const result = await createNote(
    { query: "  tides  ", text: "  the moon  " },
    { id: "alice-id" },
  );
  expect(result.ok).toBe(true);
  expect(result.value.query).toBe("tides");
  expect(result.value.text).toBe("the moon");
});

test("searchFor rejects a missing query", () => {
  const result = searchFor("   ");
  expect(result.ok).toBe(false);
  expect(result.error).toEqual({
    status: 400,
    message: "a search query is required",
  });
});

test("searchFor adds -ai-none to the search url", () => {
  const result = searchFor("how do tides work");
  expect(result.ok).toBe(true);
  expect(result.value).toBe(
    "https://www.google.com/search?q=how%20do%20tides%20work%20-ai-none",
  );
});

test("searchFor trims the query before building the url", () => {
  const result = searchFor("  tides  ");
  expect(result.ok).toBe(true);
  expect(result.value).toBe("https://www.google.com/search?q=tides%20-ai-none");
});

test("listNotes returns every note through the DTO", async () => {
  getAll.mockResolvedValueOnce([
    { _id: "one", query: "tides", text: "the moon", searchUrl: "url-one" },
    { _id: "two", query: "fish", text: "gills", searchUrl: "url-two" },
  ]);
  const notes = await listNotes();
  expect(notes).toEqual([
    { id: "one", query: "tides", text: "the moon", searchUrl: "url-one" },
    { id: "two", query: "fish", text: "gills", searchUrl: "url-two" },
  ]);
});

test("deleteNote returns a 404-shaped Err when the note does not exist", async () => {
  findById.mockResolvedValueOnce(null);
  const result = await deleteNote("000000000000000000000000");
  expect(result.ok).toBe(false);
  expect(result.error).toEqual({ status: 404, message: "Note not found" });
});

test("deleteNote removes the note when it exists", async () => {
  findById.mockResolvedValueOnce({
    _id: "fake-id",
    query: "q",
    text: "t",
    searchUrl: "u",
    ownerId: { toString: () => "alice-id" },
  });
  const result = await deleteNote("fake-id", { id: "alice-id" });
  expect(result.ok).toBe(true);
});

test("deleteNote returns a 403-shaped Err when the actor does not own the note", async () => {
  findById.mockResolvedValueOnce({
    _id: "fake-id",
    query: "q",
    text: "t",
    searchUrl: "u",
    ownerId: { toString: () => "alice-id" },
  });
  const { findById: findUserById } =
    await import("../repositories/usersRepository.js");
  findUserById.mockResolvedValueOnce({ role: "member" });
  const result = await deleteNote("fake-id", { id: "bob-id" });
  expect(result.ok).toBe(false);
  expect(result.error).toEqual({
    status: 403,
    message: "you do not have permission to delete this note",
  });
});

test("deleteNote does not remove the note when the actor is not allowed", async () => {
  findById.mockResolvedValueOnce({
    _id: "fake-id",
    query: "q",
    text: "t",
    searchUrl: "u",
    ownerId: { toString: () => "alice-id" },
  });
  const { findById: findUserById } =
    await import("../repositories/usersRepository.js");
  findUserById.mockResolvedValueOnce({ role: "member" });
  removeById.mockClear();
  await deleteNote("fake-id", { id: "bob-id" });
  expect(removeById).not.toHaveBeenCalled();
});

test("deleteNote lets an admin delete a note they do not own", async () => {
  findById.mockResolvedValueOnce({
    _id: "fake-id",
    query: "q",
    text: "t",
    searchUrl: "u",
    ownerId: { toString: () => "alice-id" },
  });
  const { findById: findUserById } =
    await import("../repositories/usersRepository.js");
  findUserById.mockResolvedValueOnce({ role: "admin" });
  const result = await deleteNote("fake-id", { id: "admin-id" });
  expect(result.ok).toBe(true);
});
