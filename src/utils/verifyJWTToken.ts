import jwt, { VerifyErrors } from "jsonwebtoken";
import { IUser } from "../models/User";

export interface DecodedData {
  data: {
    _doc: IUser;
  };
}

export default (token: string): Promise<DecodedData | null> =>
  new Promise(
    (
      resolve: (decodedData: DecodedData) => void,
      reject: (err: VerifyErrors) => void
    ) => {
      jwt.verify(
        token,
        process.env.JWT_SECRET || "UpFJfpWK",
        (err, decodedData) => {
          if (err || !decodedData) {
            console.log(err);
            
            return reject(err as VerifyErrors);
          } 

          resolve(decodedData as DecodedData);
        }
      );
    }
  );
