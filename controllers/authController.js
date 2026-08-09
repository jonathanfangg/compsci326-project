import * as authService from "../services/authService.js";
import * as usersRepository from "../repositories/usersRepository.js";
import { toUserDto } from "../dtos/userDto.js";

export const signup = async (req, res) => {
  const result = await authService.signup(req.body);
  if (!result.ok) {
    res.status(result.error.status).json({ error: result.error.message });
    return;
  }
  res.status(201).json(result.value);
};

export const login = async (req, res, next) => {
  const result = await authService.login(req.body);
  if (!result.ok) {
    res.status(result.error.status).json({ error: result.error.message });
    return;
  }

  req.session.regenerate((error) => {
    if (error) return next(error);

    req.session.userId = result.value._id.toString();
    req.session.save((error) => {
      if (error) return next(error);
      res.status(200).json({ loggedIn: true });
    });
  });
};

export const logout = (req, res, next) => {
  req.session.destroy((error) => {
    if (error) return next(error);
    res.clearCookie("connect.sid");
    res.status(200).json({ loggedIn: false });
  });
};

export const me = async (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: "not logged in" });
    return;
  }
  const user = await usersRepository.findById(req.user.id);
  if (!user) {
    res.status(401).json({ error: "not logged in" });
    return;
  }
  res.status(200).json(toUserDto(user));
};
