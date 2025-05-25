import { Router, Request, Response, NextFunction } from 'express';
import youtrackService from '../services/youtrackService';
import { AppError } from '../middleware/errorHandler';

export const youtrackRouter = Router();

// Validate ticket ID format
const validateTicketId = (ticketId: string): boolean => {
  // Basic validation: project-123 format
  return /^[A-Za-z]+-\d+$/.test(ticketId);
};

// Get ticket information by ID
youtrackRouter.get('/ticket/:ticketId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ticketId } = req.params;

    if (!validateTicketId(ticketId)) {
      throw new AppError('Invalid ticket ID format. Expected format: PROJECT-123', 400);
    }

    const ticketInfo = await youtrackService.getTicketInfo(ticketId);

    res.status(200).json({
      status: 'success',
      data: ticketInfo
    });
  } catch (error) {
    next(error);
  }
});
