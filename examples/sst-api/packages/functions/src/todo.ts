import { Todo } from '@sst-api/core/todo'
import { api, res } from '@funcy/api'
import { CreateTodoRequest, GetTodoPath, ListQuery, ListTodoResponse, TodoResponse } from './models'

export const create = api({
  parser: {
    request: CreateTodoRequest,
  },
  handler: async ({ request }) => {
    await Todo.create(request)
    return res.created()
  },
})

export const get = api({
  parser: {
    path: GetTodoPath,
    response: TodoResponse,
  },
  handler: async ({ path }) => {
    const response = await Todo.get(path.id)
    return res.ok(response)
  },
})

export const list = api({
  parser: {
    query: ListQuery,
    response: ListTodoResponse,
  },
  handler: async ({ query }) => {
    const { skip, take } = query
    const items = await Todo.list(skip, take)
    return res.ok()
  },
})

export const remove = api({
  parser: {
    path: GetTodoPath,
  },
  handler: async ({ path }) => await Todo.remove(path.id),
})
