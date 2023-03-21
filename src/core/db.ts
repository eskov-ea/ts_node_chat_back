import mongoose from "mongoose";

mongoose.connect(
  "mongodb://chat:chat@localhost:27017/chat",
  {
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
  },
  (err) => {
    if (err) {
        console.log('Error connecting to db ---> ', err);
        return;
    }
      console.log('Connection to db successful')
  }
);