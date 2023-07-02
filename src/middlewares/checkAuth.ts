import express from "express";
import { verifyJWTToken } from "../utils";
import { DecodedData } from "../utils/verifyJWTToken";

const prefix = '/api';

export default (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void => {
  console.log(req.path);
  
  if (
    req.path === prefix + "/user/signin" ||
    req.path === prefix + "/user/signup" ||
    req.path === prefix + "/user/verify"
  ) {
    return next();
  }

  let token: string | null =
    "authorization" in req.headers ? (req.headers.authorization as string) : null;
  
    if (token == null) {
      token = req.body.token;
    }
    if (token) {
      token = token?.replace('Bearer ', '');
      verifyJWTToken(token)
      .then((user: DecodedData | null) => {
        if (user) {
          req.user = user.data._doc;
        }
        next();
      })
      .catch(() => {
        res.status(403).json({ message: "Invalid auth token provided." });
      });
  } else {
    res.status(403).json({ message: "No auth token provided." });
  }
};
