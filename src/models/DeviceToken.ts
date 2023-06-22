import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./User";


export interface IDeviceToken extends Document {
  user: IUser | string;
  token: string;
}

const DeviceTokenSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    token: { type: String, require: true }
  },
  {
    timestamps: true,
  }
);

const DeviceTokenModel = mongoose.model<IDeviceToken>("DeviceToken", DeviceTokenSchema);

export default DeviceTokenModel;