"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTaskSchema = void 0;
const zod_1 = require("zod");
exports.updateTaskSchema = zod_1.z.object({
    is_done: zod_1.z.boolean(),
});
//# sourceMappingURL=roadmap.validators.js.map