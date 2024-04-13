import z from 'zod'

export const zod = {
  query: (schema: z.ZodSchema) => {},
  path: (schema: z.ZodSchema) => {},
  request: (schema: z.ZodSchema) => {},
  validate: (request: z.ZodSchema, query: z.ZodSchema, path: z.ZodSchema) => {},
}
