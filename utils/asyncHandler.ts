import { NextFunction,Request,Response } from "express";

/**
 * Wraps an async route handler and forwards any rejection to Express's
 * error handler automatically — no try/catch needed in routes.
*
 * @example
 * router.get("/users/:id", asyncHandler(async (req, res) => {
 *   const user = await UserService.findById(req.params.id);
 *   sendSuccess(res, user);
 * }));
 */
const asyncHandler = (fn:any) => (req:Request, res:Response, next:NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
