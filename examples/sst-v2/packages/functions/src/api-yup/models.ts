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
