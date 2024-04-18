import { describe, it, expect } from 'vitest'
import { api } from '../src/api'
import * as events from './data/api-proxy-events'
import { ctx } from './data/lambda-context'

// TODO check specific differences of the formats

describe('Event formats', () => {
  it('should support API proxy payload format v2', async () => {
    const fn = api({
      handler: async () => {
        return {
          statusCode: 200,
          body: {
            message: 'Hello World',
          },
        }
      },
    })

    const response = await fn(events.payloadV2 as any, ctx())
    console.log(response)
  })

  it('should support API proxy payload format v1', async () => {
    const fn = api({
      handler: async ({ event }) => {
        console.log(event)
        return {
          statusCode: 200,
          body: {
            message: 'Hello World',
          },
        }
      },
    })

    const response = await fn(events.payloadV1 as any, ctx())
    console.log(response)
  })
})
