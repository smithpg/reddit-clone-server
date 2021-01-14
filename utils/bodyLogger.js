module.exports = (req, res, next) => {
  // Log the body of the request, if applicable
  if (req.body) {
    console.log(`Request Body --------------`);
    console.log(JSON.stringify(req.body, 4));
    console.log(`---------------------------`);
  }

  next();
};
