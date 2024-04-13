export * as Todo from './todo'
import { z } from 'zod'
import crypto from 'crypto'

import { event } from './event'

export const Events = {
  Created: event(
    'todo.created',
    z.object({
      id: z.string(),
    }),
  ),
}

export async function create(dto: any) {
  const todo = {
    id: crypto.randomUUID(),
    title: 'todo',
  }

  await Events.Created.publish(todo)
  return todo
}

export function list(skip: number = 0, take: number = 20) {
  return Array(50)
    .fill(0)
    .map((_, index) => ({
      id: crypto.randomUUID(),
      title: 'Todo #' + index,
    }))
    .slice(skip, skip + take)
}
