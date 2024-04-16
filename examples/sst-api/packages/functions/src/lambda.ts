import { api, res } from '@funcy/api'

export const handler = api({
  handler: async () => {
    return res.ok(`Hello world. The time is ${new Date().toISOString()}`)
  },
})
