import mngs from 'mongoose';
const {Schema, model} = mngs;
import { IMessage } from "./Message";
import { IUser } from "./User";

export interface IUploadFile {
  filename: string;
  size: number;
  ext: string;
  url: string;
  message: IMessage | string;
  user: IUser | string;
}

const UploadFileSchema = new Schema(
  {
    filename: String,
    size: Number,
    ext: String,
    url: String,
    message: { type: Schema.Types.ObjectId, ref: "Message", require: true },
    user: { type: Schema.Types.ObjectId, ref: "User", require: true },
  },
  {
    timestamps: true,
  }
);

const UploadFileModel = model("UploadFile", UploadFileSchema);

export default UploadFileModel;
