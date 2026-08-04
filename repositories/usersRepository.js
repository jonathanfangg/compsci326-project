import { User } from "../models/userModel.js";

export const findByEmail = async (email) => User.findOne({ email });
export const findById = async (id) => User.findById(id);
export const create = async (data) => User.create(data);
