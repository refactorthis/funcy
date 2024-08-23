import { createEventBuilder, ZodValidator } from 'sst/node/event-bus'

export const event = createEventBuilder({
  // @ts-ignore
  bus: 'bus',
  validator: ZodValidator,
})
