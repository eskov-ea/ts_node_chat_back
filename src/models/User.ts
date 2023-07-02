import mongoose, { Schema, Document } from "mongoose";
import  validator from "validator";
import generatePasswordHash from "../utils/generatePasswordHash.js";
import date from "date-fns";

export interface IUser extends Document {
  email: string;
  firstname: string;
  lastname: string;
  password: string;
  confirmed: boolean;
  avatar: string;
  confirm_hash: string;
  last_seen: Date;
  data?: IUser;
}

const UserSchema = new Schema(
  {
    email: {
      type: String,
      require: "Email address is required",
      validate: [validator.isEmail, "Invalid email"],
      unique: true,
    },
    firstname: {
      type: String,
      required: "First name is required",
    },
    lastname: {
      type: String,
      required: "Last name is required",
    },
    password: {
      type: String,
      required: "Password is required",
    },
    confirmed: {
      type: Boolean,
      default: false,
    },
    avatar: String,
    confirm_hash: String,
    last_seen: {
      type: Date,
      default: new Date(),
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.virtual("isOnline").get(function (this: any) {
  return date.differenceInMinutes(new Date(), this.last_seen) < 5;
});

UserSchema.set("toJSON", {
  virtuals: true,
});

UserSchema.pre<IUser>("save", async function (next) {
  const user = this;

  if (!user.isModified("password")) {
    return next();
  }

  user.password = await generatePasswordHash(user.password) as string;
  user.confirm_hash = await generatePasswordHash(new Date().toString()) as string;
});

const UserModel = mongoose.model<IUser>("User", UserSchema);

export default UserModel;


