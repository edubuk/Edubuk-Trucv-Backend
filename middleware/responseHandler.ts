import { Response } from "express";
import { HttpStatus, HttpMessage } from "../utils/httpStatus";

//Types
interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface ResponseMeta {
  pagination?: PaginationMeta;
  [key: string]: unknown; // allows extra meta fields if needed
}

interface SendSuccessOptions {
  statusCode?: number;
  message?: string;
  meta?: ResponseMeta | null;
}

interface SuccessResponse<T> {
  success: true;
  statusCode: number;
  message: string;
  data?: T;
  meta?: ResponseMeta;
  timestamp: string;
}

interface PaginationInput {
  page?: number | string;
  limit?: number | string;
  total?: number;
}

const sendSuccess = <T = unknown>(
  res: Response,
  data: T | null = null,
  options: SendSuccessOptions = {}
): Response => {
  
  const {
    statusCode = HttpStatus.OK,
    message = HttpMessage[statusCode as keyof typeof HttpMessage] || "Success",
    meta = null,
  } = options;

  const response: SuccessResponse<T> = {
    success: true,
    statusCode,
    message,
    ...(data !== null && { data }),
    ...(meta && { meta }),
    timestamp: new Date().toISOString(),
  };

  return res.status(statusCode).json(response);
};

/**
 * Sends a 201 Created response.
 */
const sendCreated = <T = unknown>(
  res: Response,
  data: T | null = null,
  message: string = "Resource created successfully"
): Response => {
  return sendSuccess<T>(res, data, { statusCode: HttpStatus.CREATED, message });
};

/**
 * Sends a 204 No Content response.
 */
const sendNoContent = (res: Response): Response => {
  return res.status(HttpStatus.NO_CONTENT).send();
};

/**
 * Sends a paginated list response.
 */
const sendPaginated = <T = unknown>(
  res: Response,
  items: T[],
  pagination: PaginationInput
): Response => {
  const page   = Number(pagination.page  ?? 1);
  const limit  = Number(pagination.limit ?? 10);
  const total  = Number(pagination.total ?? 0);
  const totalPages = Math.ceil(total / limit);

  return sendSuccess<T[]>(res, items, {
    meta: {
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    },
  });
};

export { sendSuccess, sendCreated, sendNoContent, sendPaginated };
export type { SendSuccessOptions, SuccessResponse, PaginationMeta, ResponseMeta };