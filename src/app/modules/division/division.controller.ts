import { Request, Response } from 'express';
import { DivisionService } from './division.service';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import httpStatus from 'http-status-codes';

const createDivision = catchAsync(async (req: Request, res: Response) => {
  const { name, basePrice } = req.body;

  if (!name || !basePrice) {
    sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: 'Name and base price are required',
      data: null
    });
    return;
  }

  const existingDivision = await DivisionService.getDivisionByName(name);
  if (existingDivision) {
    sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: 'Division already exists',
      data: null
    });
    return;
  }

  const division = await DivisionService.createDivision({ name, basePrice });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: 'Division created successfully',
    data: division,
  });
});

const getAllDivisions = catchAsync(async (_req: Request, res: Response) => {
  const divisions = await DivisionService.getAllDivisions();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Divisions retrieved successfully',
    data: divisions,
  });
});

const getDivisionById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const division = await DivisionService.getDivisionById(id);

  if (!division) {
    sendResponse(res, {
      success: false,
      statusCode: httpStatus.NOT_FOUND,
      message: 'Division not found',
      data: null
    });
    return;
  }

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Division retrieved successfully',
    data: division,
  });
});

const updateDivision = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  const division = await DivisionService.updateDivision(id, updateData);

  if (!division) {
    sendResponse(res, {
      success: false,
      statusCode: httpStatus.NOT_FOUND,
      message: 'Division not found',
      data: null
    });
    return;
  }

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Division updated successfully',
    data: division,
  });
});

const deleteDivision = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const division = await DivisionService.deleteDivision(id);

  if (!division) {
    sendResponse(res, {
      success: false,
      statusCode: httpStatus.NOT_FOUND,
      message: 'Division not found',
      data: null
    });
    return;
  }

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Division deleted successfully',
    data: null
  });
});

export const DivisionController = {
  createDivision,
  getAllDivisions,
  getDivisionById,
  updateDivision,
  deleteDivision,
};