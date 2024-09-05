import { api, res } from '@refactorthis/funcy'
import z from 'zod'

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

export const create = api({
  parser: {
    request: CreateTodoRequest,
  },
  handler: async ({ request }) => res.created(request),
})

export const get = api({
  parser: {
    path: GetTodoPath,
    response: TodoResponse,
  },
  handler: async ({ path }) => res.ok(path),
})

export const list = api({
  parser: {
    query: ListQuery,
    response: ListTodoResponse,
  },
  handler: async ({ query }) => res.ok(query),
})

export const remove = api({
  parser: {
    path: GetTodoPath,
  },
  handler: async ({ path }) => res.ok(path),
})
