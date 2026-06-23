import { RequestHandler } from 'express';
import { createSuccessResponse } from '../responses/apiResponseCreator';
import { ChargingWindowResponse, EnergyMixResponse } from '../responses/response.types';
import { getEnergyMix, getOptimalChargingWindow } from '../services/energy.service';
import { chargingWindowQuerySchema, energyMixQuerySchema } from '../validations/energy.validation';

export const getMix: RequestHandler = async (req, res) => {
  const { offsetDays } = energyMixQuerySchema.parse(req.query);
  const mix = await getEnergyMix(offsetDays);
  const response: EnergyMixResponse = createSuccessResponse(mix);
  res.status(200).json(response);
};

export const getChargingWindow: RequestHandler = async (req, res) => {
  const { hours, offsetDays } = chargingWindowQuerySchema.parse(req.query);

  const window = await getOptimalChargingWindow(hours, offsetDays);
  const response: ChargingWindowResponse = createSuccessResponse(window);
  res.status(200).json(response);
};
