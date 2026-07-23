import * as notesService from "../services/notesService.js";

export const redirect = (req, res) => {
  const result = notesService.searchFor(req.query.q);
  if (!result.ok) {
    res.status(result.error.status).send(result.error.message);
    return;
  }
  res.redirect(result.value);
};
