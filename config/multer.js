const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

 const storage = new CloudinaryStorage({
   cloudinary,
   params: {
     folder: "blfullstack-blog-projectog",
     allowedFormats: ["jpeg", "png", "jpg"],
   },
 });

 const upload = multer({ storage });
 module.exports = upload;