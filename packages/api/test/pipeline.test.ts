import { describe, it, expect, vi } from 'vitest'
import { api, res } from '../'
import * as events from './data/api-proxy-events'
import { ctx } from './data/lambda-context'
import { logger } from './mocks/logger.mock'

describe('pipeline', () => {
  it('should enable cloudwatch metrics if specified', () => {
    const event: any = { ...events.payloadV2 }
    const fn = api({
      monitoring: {
        cloudWatchMetrics: {
          namespace: 'my-namespace',
        },
      },
      handler: vi.fn<any>(({ context }) => {
        expect(context.metrics).toBeDefined()
        return res.ok()
      }),
    })

    fn(event, ctx())
  })

  it('should enable full input/output logging if debug mode', async () => {
    const event: any = { ...events.payloadV2 }
    const log = logger()
    const fn = api({
      monitoring: {
        logger: () => log,
        logLevel: 'debug',
      },
      handler: () => res.ok(),
    })

    await fn(event, ctx())
    expect(log.debug).toHaveBeenCalled()
  })

  it('should add extra middleware to the pipeline if specified', async () => {
    const event: any = { ...events.payloadV2 }
    const middleware = { before: vi.fn() }
    const fn = api({
      function: {
        middleware: [middleware],
      },
      handler: () => res.ok(),
    })

    await fn(event, ctx())
    expect(middleware.before).toHaveBeenCalled()
  })

  it('should enable CORS middleware if specified', async () => {
    const event: any = { ...events.payloadV2 }
    const disabled = api({
      handler: () => res.ok(),
    })

    const r1 = await disabled(event, ctx())
    expect(r1.headers?.['Access-Control-Allow-Origin']).toBeUndefined()

    const enabled = api({
      http: { cors: { origin: 'web.mysite.com' } },
      handler: () => res.ok(),
    })

    const r2 = await enabled(event, ctx())
    expect(r2.headers?.['Access-Control-Allow-Origin']).toBe('web.mysite.com')
  })
})
