import * as authService from "../services/authService.js";
import * as usersRepository from "../repositories/usersRepository.js";
import { toUserDto } from "../dtos/userDto.js";
import { createSession, destroySession } from "../sessions.js";

export const signup = async (req, res) => {
  const result = await authService.signup(req.body);
  if (!result.ok) {
    res.status(result.error.status).json({ error: result.error.message });
    return;
  }
  res.status(201).json(result.value);
};

export const login = async (req, res) => {
  const result = await authService.login(req.body);
  if (!result.ok) {
    res.status(result.error.status).json({ error: result.error.message });
    return;
  }

  const sessionId = createSession(result.value._id.toString());
  res.cookie("sessionId", sessionId, { signed: true, httpOnly: true });
  res.status(200).json({ loggedIn: true });
};

export const logout = (req, res) => {
  const sessionId = req.signedCookies.sessionId;
  if (sessionId) {
    destroySession(sessionId);
  }
  res.clearCookie("sessionId");
  res.status(200).json({ loggedIn: false });
};

export const me = async (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: "not logged in" });
    return;
  }
  const user = await usersRepository.findById(req.user.id);
  res.status(200).json(toUserDto(user));
};
