const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");
  {
    if (!authHeader) {
      return res.status(401).json({
        error: "Not authenticated, no headers",
      });
    }
  }

  const token = authHeader.split(" ")[1];
  let decodedToken;

  try {
    decodedToken = jwt.verify(token, process.env.SECRET); // secret prefered to be 32 characters
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: "Not authenticated, no secret ..",
    });
  }
  if (!decodedToken) {
    return res.status(401).json({
      error: "Not authenticated",
    });
  }
  req.userId = decodedToken.userId; //storing decodedToken in req.userId for easier use
  console.log(req.userId);
  next();
};
