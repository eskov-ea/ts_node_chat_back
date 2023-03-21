import mngs from 'mongoose';
const {Schema, model} = mngs;


const DialogSchema = new Schema(
  {
    partner: { type: Schema.Types.ObjectId, ref: "User" },
    author: { type: Schema.Types.ObjectId, ref: "User" },
    lastMessage: { type: Schema.Types.ObjectId, ref: "Message" },
  },
  {
    timestamps: true,
  }
);

const DialogModel = model("Dialog", DialogSchema);

export default DialogModel;
