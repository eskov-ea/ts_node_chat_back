import express from "express";
import bcrypt from "bcrypt";
import {Socket, Server} from "socket.io";
import { validationResult } from "express-validator";
// import mailer from "../core/mailer";

import UserModel from "../models/User.js";
// import { IUser } from "../models/User";
import  createJWToken  from "../utils/createJWToken.js";
// import { SentMessageInfo } from "nodemailer/lib/sendmail-transport";

class UserController {
  io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  show = (req: express.Request, res: express.Response): void => {
    const id = req.params.id;
    UserModel.findById(id, (err, user) => {
      if (err) {
        return res.status(404).json({
          message: "User not found",
        });
      }
      res.json(user);
    });
  };

  getMe = (req: express.Request, res: express.Response): void => {
    const id = req.body && req.body._id;
    console.log(id)
    UserModel.findById(id, (err, user) => {
      if (err || !user) {
        return res.status(404).json({
          message: "User not found",
        });
      }
      res.json(user);
    });
  };

  findUsers = (req: express.Request, res: express.Response): void => {
    const query = req.query.query;
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
            message: `User ${user.fullname} deleted`,
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
      fullname: req.body.fullname,
      password: req.body.password,
    };

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
    } else {
      const user = new UserModel(postData);
      user
        .save()
        .then((obj) => {
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
        .catch((reason) => {
          console.log(reason)
          res.status(500).json({
            status: "error",
            message: reason,
          });
        });
    }
  };

  verify = (req: express.Request, res: express.Response): void => {
    const hash = req.query.hash;

    if (!hash) {
      res.status(422).json({ errors: "Invalid hash" });
    } else {
      UserModel.findOne({ confirm_hash: hash }, (err, user) => {
        if (err || !user) {
          return res.status(404).json({
            status: "error",
            message: "Hash not found",
          });
        }

        user.confirmed = true;
        user.save((err) => {
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

  login = (req: express.Request, res: express.Response): void => {
    const postData = {
      email: req.body.email,
      password: req.body.password,
    };

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
    } else {
      UserModel.findOne({ email: postData.email }, (err, user) => {
        if (err || !user) {
          return res.status(404).json({
            message: "User not found",
          });
        }

        if (bcrypt.compareSync(postData.password, user.password)) {
          const token = createJWToken(user);
          res.json({
            status: "success",
            token,
          });
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
