import { describe, it, expect } from 'vitest'
import { api } from '../src/api'
import * as events from './data/api-proxy-events'
import { ctx } from './data/lambda-context'

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
    const event: any = {
      ...events.payloadV2,
      body: JSON.stringify({
        hi: 'test',
      }),
    }

    const fn = api({
      handler: () => ({ statusCode: 200 }),
    })
    const response = await fn(event as any, ctx())
    expect(response.statusCode).toBe(200)
  })

  it('should support a null body response', async () => {
    const event: any = {
      ...events.payloadV2,
      body: JSON.stringify({
        hi: 'test',
      }),
    }

    const fn = api({
      handler: () => ({ statusCode: 200, body: null }),
    })
    const response = await fn(event as any, ctx())
    expect(response.statusCode).toBe(200)
  })

  // supporting void makes the interface harder to use, so skipping this.
  // it.skip('should support a void response', async () => {
  //   const fn = api({ handler: () => {} })
  //   const response = await fn(events.payloadV2 as any, ctx())
  //   expect(response.statusCode).toBe(200)
  // })
})
