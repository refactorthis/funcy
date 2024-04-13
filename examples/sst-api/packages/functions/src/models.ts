import z from 'zod'

// TODO generate this using zod-to-openapi

export const ListQuery = z.object({
  skip: z.number().optional(),
  take: z.number().optional(),
})

export const CreateTodoRequest = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  due: z.date(),
})

export const TodoResponse = z.object({
  id: z.string(),
  title: z.string(),
})
