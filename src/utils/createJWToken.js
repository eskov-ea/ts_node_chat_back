import jwt from "jsonwebtoken";
import  reduce  from "lodash";

export default (user) => {
  const token = jwt.sign(
    {
      data: reduce(
        user,
        (result, value, key) => {
          if (key !== "password") {
            result[key] = value;
          }
          return result;
        },
        {}
      ),
    },
    process.env.JWT_SECRET || "UpFJfpWK",
    {
      expiresIn: process.env.JWT_MAX_AGE || 10000000,
      algorithm: "HS256",
    }
  );

  return token;
};
