import bodyParser from "body-parser";
import express from "express";
import {Server} from "socket.io";
import { checkAuth } from "../middlewares";
import { loginValidation, registerValidation } from "../utils/validations/index.js";
// import UserCtrl from "../controllers/UserController.js";
import { DialogCtrl, UserCtrl, MessageCtrl } from "../controllers/index.js";
// import multer from "./multer";



const createRoutes = (app: express.Express, io: Server) => {
  const UserController = new UserCtrl(io);
  const DialogController = new DialogCtrl(io);
  const MessageController = new MessageCtrl(io);
  // const UploadFileController = new UploadFileCtrl();

  app.use(bodyParser.json());
  app.use(checkAuth);
  // app.use(updateLastSeen);
  
  const prefix = "/api";
  app.get(prefix + "/", (_: express.Request, res: express.Response) => {
    res.send("Hello, World2222444!");
  });


  app.get("/api", (_: express.Request, res: express.Response) => {
    res.send("Hello, World!");
  });
  // app.get(prefix + "/client", (_: express.Request, res: express.Response) => {
  //   res.sendFile('/var/www/webpushes/node_chat_back/' + 'index.html');
  // });

  app.get(prefix + "/user/me", UserController.getMe);
  // app.get("/user/verify", UserController.verify);
  app.post(prefix + "/user/signup", registerValidation, UserController.create);
  app.post(prefix + "/user/signin", loginValidation, UserController.login);
  app.post(prefix + "/user/auth", loginValidation, UserController.checkAuth);
  app.get(prefix + "/user/find", UserController.findUsers);
  app.get(prefix + "/user/:id", UserController.show);
  // app.delete("/user/:id", UserController.delete);
  
  app.get(prefix + "/dialogs/:id", DialogController.index);
  app.get(prefix + "/dialogs/find", DialogController.findDialogByUserId);
  app.delete(prefix + "/dialogs/:id", DialogController.delete);
  app.post(prefix + "/dialogs", DialogController.create);
  app.post(prefix + "/dialogs/type", DialogController.createType);
  //
  app.get(prefix + "/messages", MessageController.getMessages);
  app.post(prefix + "/messages", MessageController.create);
  app.delete(prefix + "/messages", MessageController.delete);
  
  // app.post("/files", multer.single("file"), UploadFileController.create);
  // app.delete("/files", UploadFileController.delete);
};

export default createRoutes;
