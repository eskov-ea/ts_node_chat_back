import mongoose, { Schema, Document } from "mongoose";
import { IMessage } from "./Message";
import { IDialogRole } from './DialogRole';
import { IUser } from "./User";
import { IDialogType } from './DialogType';


export interface IDialog extends Document {
  partners: IUser [] | string [];
  author: IUser | string;
  chatRoles: IDialogRole[];
  lastMessage: IMessage | string;
  name: string;
  dialog_type: IDialogType;
  dialogType: number;
}

const DialogSchema = new Schema(
  {
    partners: [{ type: Schema.Types.ObjectId, ref: "User" }],
    author: { type: Schema.Types.ObjectId, ref: "User" },
    chatRoles: {type: Schema.Types.ObjectId, ref: "DialogRole"},
    lastMessage: { type: Schema.Types.ObjectId, ref: "Message" },
    name: { type: String, require: false, default: "Chat between two users" },
    dialog_type: { type: Schema.Types.ObjectId, ref:"DialogType", require: true }
  },
  {
    timestamps: true,
  }
);

const DialogModel = mongoose.model<IDialog>("Dialog", DialogSchema);

export default DialogModel;