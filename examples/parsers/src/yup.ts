import { api, res } from '@refactorthis/funcy'
import { object, string, number, date, array } from 'yup'

export const GetTodoPath = object({
  id: string().required(),
})

export const ListQuery = object({
  skip: number(),
  take: number(),
})

export const CreateTodoRequest = object({
  id: string().required(),
  title: string().required(),
  description: string().required(),
  due: date().required(),
})

export const TodoResponse = object({
  id: string(),
  title: string(),
})

export const ListTodoResponse = object({
  items: array(TodoResponse),
  skip: number(),
  take: number(),
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
