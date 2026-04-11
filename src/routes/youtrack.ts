import { Router, Request, Response, NextFunction } from "express";
import youtrackService from "../services/youtrackService";
import { AppError } from "../middleware/errorHandler";

export const youtrackRouter = Router();

// Validate ticket ID format
const validateTicketId = (ticketId: string): boolean => {
  // Basic validation: project-123 format
  return /^[A-Za-z]+-\d+$/.test(ticketId);
};

/**
 * Get ticket information by ID
 */
youtrackRouter.get(
  "/ticket/:ticketId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { ticketId } = req.params;

      if (!validateTicketId(ticketId)) {
        throw new AppError(
          "Invalid ticket ID format. Expected format: PROJECT-123",
          400,
        );
      }

      const ticketInfo = await youtrackService.getTicketInfo(ticketId);

      res.status(200).json({
        status: "success",
        data: ticketInfo,
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * Create a new ticket as a subtask of an existing ticket.
 * Project and Stakeholder are inherited from the parent ticket.
 * Body: { title, description? }
 */
youtrackRouter.post(
  "/ticket/:parentTicketId/subtask",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { parentTicketId } = req.params;

      if (!validateTicketId(parentTicketId)) {
        throw new AppError(
          "Invalid parent ticket ID format. Expected format: PROJECT-123",
          400,
        );
      }

      const { title, description } = req.body;

      if (!title || typeof title !== "string" || title.trim() === "") {
        throw new AppError(
          "title is required and must be a non-empty string",
          400,
        );
      }

      const result = await youtrackService.createSubTicket(
        parentTicketId,
        title.trim(),
        typeof description === "string" ? description : "",
      );

      res.status(201).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * Get tickets changed in a given range (today or yesterday)
 */
youtrackRouter.get(
  "/tickets/changes/:from/:to",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { from, to } = req.params;
      const tickets = await youtrackService.getTicketsChangedByRange(from, to);
      res.status(200).json({ status: "success", data: tickets });
    } catch (error) {
      next(error);
    }
  },
);
