import mongoose, { Schema, Document } from "mongoose";


export interface IDialogType extends Document {
  _id: any;
  dialog_type_id: Number;
  dialog_type_name: string;
}

const DialogTypeSchema  = new Schema(
  {
    dialog_type_id: {type: Number, require: true},
    dialog_type_name: {type: String, require: true},
  }
);

const DialogTypeModel = mongoose.model<IDialogType>("DialogType", DialogTypeSchema);

export default DialogTypeModel;