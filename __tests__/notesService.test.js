import { jest } from "@jest/globals";

jest.unstable_mockModule("../repositories/notesRepository.js", () => ({
  getAll: jest.fn(),
  create: jest.fn((data) => ({ _id: "fake-id", ...data })),
}));

const { createNote, listNotes, searchFor } =
  await import("../services/notesService.js");
const { getAll } = await import("../repositories/notesRepository.js");

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
  const result = await createNote({
    query: "how do tides work",
    text: "The moon pulls water toward it.",
  });
  expect(result.ok).toBe(true);
  expect(result.value).toEqual({
    query: "how do tides work",
    text: "The moon pulls water toward it.",
    searchUrl:
      "https://www.google.com/search?q=how%20do%20tides%20work%20-ai-none",
  });
});

test("createNote trims the query and the text before saving", async () => {
  const result = await createNote({ query: "  tides  ", text: "  the moon  " });
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
    { query: "tides", text: "the moon", searchUrl: "url-one" },
    { query: "fish", text: "gills", searchUrl: "url-two" },
  ]);
});
