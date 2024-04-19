import { describe, it, expect } from 'vitest'
import { api } from 'package/src/integrations/api'
import * as events from '../../mocks/api-proxy-events'
import { ctx } from '../../mocks/lambda-context'
import { APIGatewayProxyEventV2 } from 'aws-lambda'

describe('Handlers', () => {
  it('should support an anonymous JSON body and stringify', async () => {
    const event: any = {
      ...events.payloadV2,
      body: JSON.stringify({
        hi: 'test',
      }),
    }

    const fn = api({
      handler: () => ({
        statusCode: 200,
        body: {
          hi: 'hello',
        },
      }),
    })

    const response = await fn(event, ctx())
    expect(response.body).toBe('{"hi":"hello"}')
    expect(response.statusCode).toBe(200)
  })

  it('should support an undefined body response', async () => {
    const event: APIGatewayProxyEventV2 = {
      ...events.payloadV2,
      body: JSON.stringify({
        hi: 'test',
      }),
    }

    const fn = api({
      handler: () => ({ statusCode: 200 }),
    })
    const response = await fn(event, ctx())
    expect(response.statusCode).toBe(200)
  })

  it('should support a null body response', async () => {
    const event: APIGatewayProxyEventV2 = {
      ...events.payloadV2,
      body: JSON.stringify({
        hi: 'test',
      }),
    }

    const fn = api({
      handler: () => ({ statusCode: 200, body: null }),
    })
    const response = await fn(event, ctx())
    expect(response.statusCode).toBe(200)
  })

  // supporting void makes the interface harder to use, so removing pending decision.
  // it.skip('should support a void response', async () => {
  //   const fn = api({ handler: () => {} })
  //   const response = await fn(events.payloadV2, ctx())
  //   expect(response.statusCode).toBe(200)
  // })
})
