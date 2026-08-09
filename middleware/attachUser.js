export const attachUser = (req, res, next) => {
  if (req.session.userId) {
    req.user = { id: req.session.userId };
  }
  next();
};
