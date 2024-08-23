import { func } from '@refactorthis/funcy'

export const handler = func({
  handler: async () => {
    return `Hello world. The time is ${new Date().toISOString()}`
  },
})
