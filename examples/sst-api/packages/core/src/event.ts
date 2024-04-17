import { createEventBuilder, ZodValidator } from 'sst/node/event-bus'

export const event = createEventBuilder({
  // @ts-expect-error
  bus: 'bus',
  validator: ZodValidator,
})
