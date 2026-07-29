import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    query: { type: String, required: true },
    text: { type: String, required: true },
    searchUrl: { type: String, required: true },
  },
  { timestamps: true },
);

const Note = mongoose.model("Note", noteSchema);

export const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
export const getAll = async () => Note.find().lean();
export const findById = async (id) => Note.findById(id).lean();
export const create = async (data) => (await Note.create(data)).toObject();
export const updateById = async (id, data) =>
  Note.findByIdAndUpdate(id, data, { new: true }).lean();
export const removeById = async (id) => {
  await Note.findByIdAndDelete(id);
};
