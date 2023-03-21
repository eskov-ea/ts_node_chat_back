// // import express from "express";
//
// import cloudinary from "../core/cloudinary";
// import { UploadFileModel } from "../models";
//
// class UserController {
//   create = (req, res) => {
//     const userId = req.user._id;
//     const file = req.file;
//
//     cloudinary.v2.uploader
//       .upload_stream(
//         { resource_type: "auto" },
//         (
//           error , result
//         ) => {
//           if (error || !result) {
//             return res.status(500).json({
//               status: "error",
//               message: error || "upload error",
//             });
//           }
//
//           const fileData = {
//             filename: result.original_filename,
//             size: result.bytes,
//             ext: result.format,
//             url: result.url,
//             user: userId,
//           };
//
//           const uploadFile = new UploadFileModel(fileData);
//
//           uploadFile
//             .save()
//             .then((fileObj) => {
//               res.json({
//                 status: "success",
//                 file: fileObj,
//               });
//             })
//             .catch((err) => {
//               res.json({
//                 status: "error",
//                 message: err,
//               });
//             });
//         }
//       )
//       .end(file.buffer);
//   };
//
//   delete = (req, res) => {
//     const fileId = req.user._id;
//     UploadFileModel.deleteOne({ _id: fileId }, function (err) {
//       if (err) {
//         return res.status(500).json({
//           status: "error",
//           message: err,
//         });
//       }
//       res.json({
//         status: "success",
//       });
//     });
//   };
// }
//
// export default UserController;
