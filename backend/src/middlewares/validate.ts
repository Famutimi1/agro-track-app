import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { ApiError } from "../utils/api-error";

export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      const nestedErrors = result.error.errors.map(e => `${e.path.join(".")}: ${e.message}`);
      const message = nestedErrors.length > 0
        ? nestedErrors.join("; ")
        : Object.entries(errors)
            .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(", ")}`)
            .join("; ");
      throw ApiError.badRequest(`Validation failed: ${message}`);
    }

    const data = result.data as { body?: unknown; query?: unknown; params?: unknown };
    if (data.body) req.body = data.body;
    if (data.query) req.query = data.query as Record<string, string>;
    if (data.params) req.params = data.params as Record<string, string>;

    next();
  };
}
