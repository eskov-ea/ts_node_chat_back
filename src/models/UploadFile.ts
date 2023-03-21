import mngs from 'mongoose';
const {Schema, model} = mngs;



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
