import z from 'zod'

// NOTE this can be generated using zod-to-openapi

export const GetTodoPath = z.object({
  id: z.string(),
})

export const ListQuery = z.object({
  skip: z.number().optional(),
  take: z.number().optional(),
})

export const CreateTodoRequest = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  due: z.coerce.date(),
})

export const TodoResponse = z.object({
  id: z.string(),
  title: z.string(),
})

export const ListTodoResponse = z.object({
  items: z.array(TodoResponse),
  skip: z.number(),
  take: z.number(),
})
