import multer from 'src/core/multer';
const storage = multer.memoryStorage();

const uploader = multer({ storage });

export default uploader;
