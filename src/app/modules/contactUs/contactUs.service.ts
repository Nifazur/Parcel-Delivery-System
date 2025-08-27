import { ContactUs } from "./contactUs.model";
import { IContactUs } from "./contactUs.interface";

const createMessage = async (data: IContactUs) => {
  const message = new ContactUs(data);
  return await message.save();
};

const getAllMessages = async () => {
  return await ContactUs.find().sort({ createdAt: -1 });
};

const getMessageById = async (id: string) => {
  return await ContactUs.findById(id);
};

export const ContactUsService = {
  createMessage,
  getAllMessages,
  getMessageById,
};