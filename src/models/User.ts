import mngs from 'mongoose';
const {Schema, model} = mngs;
import isEmail from 'validator/lib/isEmail.js';
import generatePasswordHash from "../utils/generatePasswordHash.js";
import date from "date-fns";

const UserSchema = new Schema(
  {
    email: {
      type: String,
      require: "Email address is required",
      validate: [isEmail, "Invalid email"],
      unique: true,
    },
    fullname: {
      type: String,
      required: "Fullname is required",
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

UserSchema.virtual("isOnline").get(function () {
  return date.differenceInMinutes(new Date(), this.last_seen) < 5;
});

UserSchema.set("toJSON", {
  virtuals: true,
});

UserSchema.pre("save", async function (next) {
  const user = this;

  if (!user.isModified("password")) {
    return next();
  }

  user.password = await generatePasswordHash(user.password);
  user.confirm_hash = await generatePasswordHash(new Date().toString());
});

const UserModel = model("User", UserSchema);

export default UserModel;


