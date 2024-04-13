import { funcy, res } from '@funcy/api'

export const handler = funcy.handler({
  handler: async () => {
    return res.ok(`Hello world. The time is ${new Date().toISOString()}`)
  },
})
