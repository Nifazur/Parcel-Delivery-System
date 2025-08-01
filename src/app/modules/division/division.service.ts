import { Division } from './division.model';
import { IDivision } from './division.interface';

const createDivision = async (divisionData: IDivision) => {
  const division = new Division(divisionData);
  return await division.save();
};

const getAllDivisions = async () => {
  return await Division.find().select('name basePrice');
};

const getDivisionById = async (id: string) => {
  return await Division.findById(id);
};

const updateDivision = async (id: string, updateData: Partial<IDivision>) => {
  return await Division.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  });
};

const deleteDivision = async (id: string) => {
  return await Division.findByIdAndDelete(id);
};

const getDivisionByName = async (name: string) => {
  return await Division.findOne({ name: name.trim() });
};

export const DivisionService = {
  createDivision,
  getAllDivisions,
  getDivisionById,
  updateDivision,
  deleteDivision,
  getDivisionByName
};