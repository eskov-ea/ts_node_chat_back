import express from "express";
import {Server} from "socket.io";
import { MessageModel, DialogModel } from "../models/index.js";
import { IMessage } from "../models/Message.js";
import { IDialog } from "../models/Dialog.js";

interface MessageControllerI {
  create: Function;
  delete: Function;
  getMessages: Function;
  updateReadStatus: Function;
}

class MessageController implements MessageControllerI {
  io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  updateReadStatus = (res: express.Response, userId: string, 
    dialogId: string): void => {
    MessageModel.updateMany(
      { dialog: dialogId, user: { $ne: userId } },
      { $set: { read: true } },
      {},
      (err: any): void => {
        if (err) {
          res.status(500).json({
            status: "error",
            message: err,
          });
        } else {
          this.io.emit("SERVER:MESSAGES_READED", {
            userId,
            dialogId,
          });
        }
      }
    );
  };

  getMessages = (req: express.Request, res: express.Response): void => {
    const dialogId: string = req.query.dialog as string;
    const userId: string = req.query._id as string;

    //TODO: check if user has access to the dialog
    // DialogModel.findOne({_id: dialogId})
    //   .exec(function (err, dialog) {
    //     if (err) {
    //       return res.status(404).json({
    //         status: "error",
    //         message: "Messages not found",
    //       });
    //     } else if (dialog) {
        
    //       if (dialog.author == userId ) {

    //       } 
    //       if (is<IUser>(dialog.partners))
    //     }
    //   });


    this.updateReadStatus(res, userId, dialogId);
    console.log("Get messages:  " + userId + "  " + dialogId);
    
    MessageModel.find({ dialog: dialogId })
      .sort({"updatedAt": -1})
      .populate(["dialog", "user", "attachments"])
      .sort({"createdAt": -1})
      .exec(function (err, messages) {
        if (err) {
          return res.status(404).json({
            status: "error",
            message: "Messages not found",
          });
        }
        res.json(messages);
      });
      this.io.emit("SERVER:UPDATE_STATUS", dialogId);
  };

  create = (req: express.Request, res: express.Response): void => {
    const userId = req.body.user_id;

    const postData = {
      text: req.body.text,
      dialog: req.body.dialog_id,
      attachments: req.body.attachments,
      author: userId,
    };
    const message = new MessageModel(postData);

    console.log(postData);
    this.updateReadStatus(res, userId, req.body.dialog_id);

    message
      .save()
      .then((obj: IMessage) => {
        obj.populate(
          "dialog user attachments",
          (err: any, message: IMessage) => {
            if (err) {
              return res.status(500).json({
                status: "error",
                message: err,
              });
            }
            console.log("Update last message:   " + message._id + "   " + message.dialog);
            

            DialogModel.findOneAndUpdate(
              { _id: postData.dialog },
              { lastMessage: message._id },
              { upsert: true },
              function (err, dialog) {
                if (err) {
                  return res.status(500).json({
                    status: "error",
                    message: err,
                  });
                }
                console.log("Update last message:   " + message._id + "   " + dialog);
              }
            );

            res.json(message);
            //console.log(this.io.clients[message.dialog.partner]);
            // (this.io.clients[message.dialog.partner]).emit("SERVER:NEW_MESSAGE", message);
	    this.io.emit("SERVER:NEW_MESSAGE", message);
          }
        );
      })
      .catch((reason) => {
        res.json(reason);
      });
  };

  delete = (req: express.Request, res: express.Response): void => {
    const id: string = req.body.message_id;
    const userId: string = req.body.user_id;
    console.log("Delete message:  " + id + "  " + userId);
    
    MessageModel.findById(id, (err: any, message: any) => {
      if (err || !message) {
        return res.status(404).json({
          status: "error",
          message: "Message not found",
        });
      }

      if (message.author.toString() === userId) {
        const dialogId = message.dialog;
        message.remove();

        MessageModel.findOne(
          { dialog: dialogId },
          {},
          { sort: { created_at: -1 } },
          (err, lastMessage) => {
            if (err) {
              res.status(500).json({
                status: "error",
                message: err,
              });
            }

            DialogModel.findById(dialogId, (err: any, dialog: any) => {
              if (err) {
                res.status(500).json({
                  status: "error",
                  message: err,
                });
              }

              if (!dialog) {
                return res.status(404).json({
                  status: "not found",
                  message: err,
                });
              }

              dialog.lastMessage = lastMessage ? lastMessage._id.toString() : "";
              dialog.save();
            });
          }
        );

        return res.json({
          status: "success",
          message: "Message deleted",
        });
      } else {
        return res.status(403).json({
          status: "error",
          message: "Not have permission",
        });
      }
    });
  };
}

export default MessageController;
