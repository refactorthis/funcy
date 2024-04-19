import { describe, it } from 'vitest'
import { api } from 'package/src/integrations/api'
import * as events from '../../mocks/api-proxy-events'
import { ctx } from '../../mocks/lambda-context'

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

    const response = await fn({ ...events.payloadV2 }, ctx())
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

    const response = await fn({ ...events.payloadV1 }, ctx())
    console.log(response)
  })
})
