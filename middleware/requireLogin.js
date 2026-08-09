export const requireLogin = (req, res, next) => {
  if (!req.user) {
    res.status(401).json({ error: "you must be logged in to do that" });
    return;
  }
  next();
};
