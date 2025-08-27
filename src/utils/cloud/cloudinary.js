import { v2 as cloudinary } from "cloudinary";
cloudinary.config({
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  cloud_name: process.env.CLOUD_NAME,
});
export async function uploadFile({ path, options }) {
  return await cloudinary.uploader.upload(path, options);
}
export async function uploadFiles({ files, options }) {
  let attachments = [];
  for (const file of files) {
    const { secure_url, public_id } = await uploadFile({
      path: file.path,
      options,
    });
    attachments.push({ secure_url, public_id });
  }
  return attachments;
}
export async function deleteFolder(path) {
  await cloudinary.api.delete_resources_by_prefix(path);
  await cloudinary.api.delete_folder(path);
}
export default cloudinary;
