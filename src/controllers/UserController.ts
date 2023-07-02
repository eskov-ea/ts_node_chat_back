import express from "express";
import bcrypt from "bcrypt";
import {Server} from "socket.io";
import { validationResult } from "express-validator";
// import mailer from "../core/mailer";

import UserModel, { IUser } from "../models/User";
// import { IUser } from "../models/User";
import  createJWToken  from "../utils/createJWToken";
import DeviceTokenModel, { IDeviceToken } from "../models/DeviceToken";
// import { SentMessageInfo } from "nodemailer/lib/sendmail-transport";

class UserController {
  io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  show = (req: express.Request, res: express.Response): void => {
    const id = req.params.id;
    UserModel.findById(id, {password: 0, confirm_hash: 0})
    .exec(function (err: any, user: any){
      if (err) {
        return res.status(404).json({
          message: "User not found",
        });
      } else {
        return res.status(200).json({
          user
        });
      }
    });
  };

  getMe = (req: express.Request, res: express.Response): void => {
    const id = req.body && req.body._id;
    console.log("Get me: " + id);
    UserModel.findById(id, (err: any, user: IUser) => {
      if (err || !user) {
        return res.status(404).json({
          message: "User not found",
        });
      }
      res.json(user);
    });
  };

  findUsers = (req: express.Request, res: express.Response): void => {
    const query: string = req.query.query as string;
    UserModel.find()
      .or([
        { fullname: new RegExp(query, "i") },
        { email: new RegExp(query, "i") },
      ])
      .then((users) => res.json(users))
      .catch((err) => {
        return res.status(404).json({
          status: "error",
          message: err,
        });
      });
  };

  delete = (req: express.Request, res: express.Response): void => {
    const id = req.params.id;
    UserModel.findOneAndRemove({ _id: id })
      .then((user) => {
        if (user) {
          res.json({
            message: `User ${user.firstname} ${user.lastname} deleted`,
          });
        } else {
          res.status(404).json({
            status: "error",
          });
        }
      })
      .catch((err) => {
        res.json({
          message: err,
        });
      });
  };

  create = (req: express.Request, res: express.Response): void => {
    console.log("user create");
    const postData = {
      email: req.body.email,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      password: req.body.password,
    };

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
    } else {
      const user = new UserModel(postData);
      user
        .save()
        .then((obj: IUser) => {
          console.log(obj)
          res.json(obj);
          // mailer.sendMail(
          //   {
          //     from: "admin@test.com",
          //     to: postData.email,
          //     subject: "Подтверждение почты React Chat Tutorial",
          //     html: `Для того, чтобы подтвердить почту, перейдите <a href="http://localhost:3000/signup/verify?hash=${obj.confirm_hash}">по этой ссылке</a>`,
          //   },
          //   function (err, info) {
          //     if (err) {
          //       console.log(err);
          //     } else {
          //       console.log(info);
          //     }
          //   }
          // );
        })
        .catch((reason: any) => {
          console.log(reason)
          res.status(500).json({
            status: "error",
            message: reason,
          });
        });
    }
  };

  verify = (req: express.Request, res: express.Response): void => {
    const hash: string = req.query.hash as string;

    if (!hash) {
      res.status(422).json({ errors: "Invalid hash" });
    } else {
      UserModel.findOne({ confirm_hash: hash }, (err: any, user: IUser) => {
        if (err || !user) {
          return res.status(404).json({
            status: "error",
            message: "Hash not found",
          });
        }

        user.confirmed = true;
        user.save((err: any) => {
          if (err) {
            return res.status(404).json({
              status: "error",
              message: err,
            });
          }

          res.json({
            status: "success",
            message: "Аккаунт успешно подтвержден!",
          });
        });
      });
    }
  };

  checkAuth = (req: express.Request, res: express.Response): void => {
    res.status(200).json({
      status: "success"
    });
  }

  login = (req: express.Request, res: express.Response): void => {
    const postData = {
      email: req.body.email,
      password: req.body.password,
    };
    const errors = validationResult(req);

    if (!errors.isEmpty()) {

    res.status(422).json({ errors: errors.array() });
    } else {
      UserModel.findOne({ email: postData.email }, (err: any, user: IUser) => {
        if (err || !user) {
          return res.status(404).json({
            message: "User not found",
          });
        }

        if (bcrypt.compareSync(postData.password, user.password)) {
          const token = createJWToken(user);

          const deviceTokenString = req.body.device_token;
          if (deviceTokenString) {
            DeviceTokenModel.findOne({ token: deviceTokenString }, (err: any, deviceToken: IDeviceToken) => {
              if (err) {
                //TODO: implement Exception cannot store device token
                return res.json({
                  status: "warning",
                  token,
                  user
                });
              } else if (deviceToken) {
                return res.json({
                  status: "success",
                  token,
                  user
                });
              } else {
                const newDeviceToken = new DeviceTokenModel({
                  user: user,
                  token: deviceTokenString
                });
                newDeviceToken.save((err: any) => {
                  if (err) {
                    //TODO: implement Exception cannot store device token
                    res.json({
                      status: "warning",
                      token,
                      user
                    });
                  } else {
                    res.json({
                      status: "success",
                      token,
                      user
                    });
                  }
                });
              }
            });
          } else {
            res.json({
              status: "success",
              token,
              user
            });
          }

        } else {
          res.status(403).json({
            status: "error",
            message: "Incorrect password or email",
          });
        }
      });
    }
  };
}

export default UserController;
