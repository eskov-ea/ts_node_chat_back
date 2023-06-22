import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./User";

// enum: "admin", "user"
export interface IDialogRole extends Document {
  _id: any;
  user: IUser | string;
  chatRole: string;
}

const DialogRolesSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", require: true },
    role: { type: String, require: Boolean }
  },
  {
    timestamps: true,
  }
);

const DialogRoleModel = mongoose.model("DialogRole", DialogRolesSchema);

export default DialogRoleModel;