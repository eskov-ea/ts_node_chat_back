import express from 'express';
import {Server} from 'socket.io';
import { IDialog } from '../models/Dialog.js';
import { DialogModel, MessageModel } from '../models/index.js';
import DialogTypeModel, { IDialogType } from '../models/DialogType.js';
import { IMessage } from '../models/Message.js';

class DialogController {
  io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  index = (req: express.Request, res: express.Response): void => {
  const dialogId = req.params.id;
	console.log("request params:  " + req.params.id);
    DialogModel.find()
      .or({ _id: dialogId })
      .populate(['author', 'partner'])
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'user',
        },
      })
      .exec(function (err: any, dialogs: any) {
        console.log("find dialog:  " + dialogs);
        if (err) {
          return res.status(404).json({
            message: 'Dialogs not found',
          });
        }
        return res.json(dialogs);
      });
  };
  findDialogByUserId = (req: express.Request, res: express.Response): void => {
    const id = req.params.id;
    console.log("request params:  " + req.params.id);
      DialogModel.find([{ author: id }, {partner: id}])
        .or([{ author: id }, {partner: id}])
        .populate(['author', 'partner'])
        .populate({
          path: 'lastMessage',
          populate: {
            path: 'user',
          },
        })
        .exec(function (err: any, dialogs: any) {
          console.log("find dialog:  " + dialogs);
          if (err) {
            return res.status(404).json({
              message: 'Dialogs not found',
            });
          }
          return res.json(dialogs);
        });
    };

  createType = (req: express.Request, res: express.Response): void => {
    const data = {
      dialog_type_id: 2,
      dialog_type_name: 'group'
    }

    const dialogType = new DialogTypeModel(data);

    dialogType.save().then(() => {
      return res.status(200).json({
        status: 'success',
        message: dialogType,
      });
    })
    .catch(err => {
      return res.status(500).json({
        status: 'error',
        message: err,
      });
    });
  }

  findDialog = (req: express.Request, res: express.Response): void => {
    const userId = req.params.userId;
    const partnerId = req.params.partnerId;

    DialogModel.find()
      .or([{author: userId, partner: partnerId}, {author: partnerId, partner: userId}])
      .populate(['author', 'partner'])
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'user',
        },
      })
      .exec(function (err: any, dialogs: any) {
        if (err) {
          return res.status(404).json({
            message: 'Dialogs not found',
          });
        }
        return res.json(dialogs);
      });
  };

  create = (req: express.Request, res: express.Response): void => {
    console.log(req.body)
    const postData = {
      author: req.body.userId,
      partners: req.body.partnerId,
      message: req.body.message,
      dialog_type: undefined
    };
    console.log("postData")

    DialogTypeModel.findOne(
      {
        dialog_type_id: req.body.dialogType
      },
      (err: any, dialogType: IDialogType) => {
        if (err) {
          return res.status(500).json({
            status: 'error',
            message: err,
          });
        } if (dialogType) {
          postData.dialog_type = dialogType._id;
          return
        } else {
          console.log("DialogType:  " +req.body.dialogType);
          return res.status(500).json({
            status: 'error',
            message: 'No dialog type found',
          });
        }
      }
    );
    DialogModel.findOne(
      {
        author: req.body.userId,
        partners: req.body.partnerId,
        dialogType: postData.dialog_type
      },
      (err: any, dialog: IDialog) => {
        if (err) {
          return res.status(500).json({
            status: 'error',
            message: err,
          });
        }
        if (dialog) {
          return res.status(403).json({
            status: 'error',
            message: 'Такой диалог уже есть',
          });
        } else {
          const dialog = new DialogModel(postData);

          dialog
            .save()
            .then((dialogObj: any) => {
              const message = new MessageModel({
                text: postData.message,
                author: postData.author,
                dialog: dialogObj._id,
              });

              message
                .save()
                .then(() => {
                  dialogObj.lastMessage = message._id;
                  dialogObj.save().then(() => {
                    res.json(dialogObj);
                    this.io.emit('SERVER:DIALOG_CREATED', {
                      ...postData,
                      dialog: dialogObj,
                    });
                  });
                })
                .catch((reason: any) => {
                  res.json(reason);
                });
            })
            .catch((err: any) => {
              res.json({
                status: 'error',
                message: err,
              });
            });
        }
      },
    );
  };

  delete = (req: express.Request, res: express.Response): void => {
    const id = req.params.id;
    DialogModel.findOneAndRemove({ _id: id })
      .then((dialog: any) => {
        if (dialog) {
          console.log("Dialog id:  " + dialog._id);
          MessageModel.find({dialog: dialog._id})
            .then((messages: IMessage[]) => {
              messages.forEach((message) => {
                message.delete();
              });
            });
          res.json({
            message: `Dialog deleted`,
          });
        } else {
          res.json({
            message: `Dialog not found`,
          });
        }
      })
      .catch(() => {
        res.json({
          message: `Error. The dialog is not deleted`,
        });
      });
  };
}

export default DialogController;
