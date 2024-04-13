import { Todo } from '@sst-api/core/todo'
import { funcy, res } from '@funcy/api'
import { CreateTodoRequest, TodoResponse, ListQuery } from './models'

export const create = funcy.handler({
  validation: {
    type: 'zod',
    request: CreateTodoRequest,
    response: TodoResponse,
  },
  handler: async ({ request }) => {
    const todo = await Todo.create(request)
    return res.ok(todo)
  },
})

export const list = funcy.handler({
  validation: {
    type: 'zod',
    query: ListQuery,
  },
  handler: async ({ query }) => {
    const { skip, take } = query
    const items = Todo.list(skip, take)
    return res.ok({ items, skip, take })
  },
})
