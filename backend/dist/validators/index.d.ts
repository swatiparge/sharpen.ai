import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
/**
 * Express middleware factory that validates req.body against a Zod schema.
 * Returns 400 with structured errors on failure, otherwise attaches parsed data to req.body.
 */
export declare function validate(schema: ZodSchema): (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=index.d.ts.map