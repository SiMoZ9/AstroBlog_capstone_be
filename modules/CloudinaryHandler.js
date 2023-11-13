const cloudinary = require("cloudinary").v2;

module.exports = async function handleUpload(file) {
    const res = await cloudinary.uploader.upload(file, {
        resource_type: "auto",
    });
    return res;
}
