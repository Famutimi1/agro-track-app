import { Request, Response, NextFunction } from "express";
import { ZodObject, ZodSchema } from "zod";
import { ApiError } from "../utils/api-error";

export function validate(schema: ZodSchema, source: "body" | "query" | "params" = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const structured = schema instanceof ZodObject && ["body", "query", "params"].some(key => key in schema.shape);
    const result = schema.safeParse(structured ? { body: req.body, query: req.query, params: req.params } : req[source]);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      const message = Object.entries(errors)
        .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(", ")}`)
        .join("; ");
      throw ApiError.badRequest(`Validation failed: ${message}`);
    }

    if (structured) {
      for (const key of ["body", "query", "params"] as const) {
        if (result.data[key] !== undefined) req[key] = result.data[key];
      }
    } else req[source] = result.data;
    next();
  };
}
