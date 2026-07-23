import { readFile, writeFile } from "fs/promises";

const DATA_FILE = "notes.json";

export const getAll = async () => {
  const data = await readFile(DATA_FILE, "utf-8");
  return JSON.parse(data);
};

export const save = async (notes) => {
  await writeFile(DATA_FILE, JSON.stringify(notes, null, 2));
};
