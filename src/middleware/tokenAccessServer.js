import dotenv from "dotenv";

dotenv.config();

export const tokenAccessServer = (req, res, next) => {
  const secretkey = req.headers["x-secret-key"];
  const serverkey = process.env.PRIVATE_KEY_SERVER;

  if (secretkey !== serverkey) {
    return res.status(401).send("Unauthorized");
  }
  next();
};
