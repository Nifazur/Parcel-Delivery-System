import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { ContactUsService } from "./contactUs.service";

const createMessage = catchAsync(async (req: Request, res: Response) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: "Name, email, and message are required",
      data: null,
    });
    return;
  }

  const newMessage = await ContactUsService.createMessage({ name, email, message });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Message sent successfully",
    data: newMessage,
  });
});

const getAllMessages = catchAsync(async (_req: Request, res: Response) => {
  const messages = await ContactUsService.getAllMessages();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Messages retrieved successfully",
    data: messages,
  });
});

const getMessageById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const message = await ContactUsService.getMessageById(id);

  if (!message) {
    sendResponse(res, {
      success: false,
      statusCode: httpStatus.NOT_FOUND,
      message: "Message not found",
      data: null,
    });
    return;
  }

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Message retrieved successfully",
    data: message,
  });
});

export const ContactUsController = {
  createMessage,
  getAllMessages,
  getMessageById,
};