import { object, string, number, date, array } from 'yup'

export const GetTodoPath = object({
  id: string().required(),
})

export const ListQuery = object({
  skip: number().optional(),
  take: number().optional(),
})

export const CreateTodoRequest = object({
  id: string(),
  title: string(),
  description: string(),
  due: date(),
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
