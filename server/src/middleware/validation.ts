import { Request, Response, NextFunction } from "express";

export interface ValidationRule {
  field: string;
  type: "string" | "number" | "email" | "array" | "boolean";
  required?: boolean;
  min?: number;
  max?: number;
}

export function validateBody(rules: ValidationRule[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];

    for (const rule of rules) {
      const val = req.body[rule.field];

      if (rule.required && (val === undefined || val === null || val === "")) {
        errors.push(`Field '${rule.field}' is required.`);
        continue;
      }

      if (val !== undefined && val !== null && val !== "") {
        if (rule.type === "string" && typeof val !== "string") {
          errors.push(`Field '${rule.field}' must be a string.`);
        } else if (rule.type === "number" && typeof val !== "number") {
          errors.push(`Field '${rule.field}' must be a number.`);
        } else if (rule.type === "boolean" && typeof val !== "boolean") {
          errors.push(`Field '${rule.field}' must be a boolean.`);
        } else if (rule.type === "array" && !Array.isArray(val)) {
          errors.push(`Field '${rule.field}' must be an array.`);
        } else if (rule.type === "email") {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (typeof val !== "string" || !emailRegex.test(val)) {
            errors.push(`Field '${rule.field}' must be a valid email address.`);
          }
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ message: "Validation error", errors });
    }

    next();
  };
}
