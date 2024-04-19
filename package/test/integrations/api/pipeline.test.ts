import { describe, it, expect, vi } from 'vitest'
import { api, res } from 'package/src/integrations/api'
import * as events from '../../mocks/api-proxy-events'
import { ctx } from '../../mocks/lambda-context'
import { logger } from '../../mocks/logger.mock'

describe('pipeline', () => {
  it('should enable security headers if specified', async () => {
    const event: any = { ...events.payloadV2 }
    const disabled = api({
      handler: () => res.ok(),
    })

    const r1 = await disabled(event, ctx())
    expect(r1.headers?.['X-Powered-By']).toBeUndefined()

    const enabled = api({
      http: { security: { poweredBy: { server: 'myserver' } } },
      handler: () => res.ok(),
    })

    const r2 = await enabled(event, ctx())
    expect(r2.headers?.['X-Powered-By']).toBe('myserver')
  })

  it('should enable full input/output logging if debug mode', async () => {
    const log = logger()
    const disabled = api({
      monitoring: { logger: () => log, logLevel: 'info' },
      handler: () => res.ok(),
    })

    await disabled({ ...events.payloadV2 }, ctx())
    expect(log.debug).not.toHaveBeenCalled()

    const enabled = api({
      monitoring: { logger: () => log, logLevel: 'debug' },
      handler: () => res.ok(),
    })

    await enabled({ ...events.payloadV2 }, ctx())
    expect(log.debug).toHaveBeenCalled()
  })

  // TODO Need to mock the embedded metrics provider
  it.skip('should enable cloudwatch metrics if specified', async () => {
    const disabled = api({
      handler: ({ context }) => res.ok({ metrics: !!context.metrics }),
    })

    const r1 = await disabled({ ...events.payloadV2 }, ctx())
    expect(JSON.parse(r1.body!).metrics).toBeUndefined()

    const enabled = api({
      monitoring: { cloudWatchMetrics: { namespace: 'my-namespace' } },
      handler: ({ context }) => {
        return res.ok({ metrics: !!context.metrics })
      },
    })

    const r2 = await enabled({ ...events.payloadV2 }, ctx())
    expect(JSON.parse(r2.body!).metrics).toBeDefined()
  })

  it('should add extra middleware to the pipeline if specified', async () => {
    const middleware = { before: vi.fn() }
    const fn = api({
      function: { middleware: [middleware] },
      handler: () => res.ok(),
    })

    await fn({ ...events.payloadV2 }, ctx())
    expect(middleware.before).toHaveBeenCalled()
  })

  it('should enable CORS middleware if specified', async () => {
    const disabled = api({ handler: () => res.ok() })

    const r1 = await disabled({ ...events.payloadV2 }, ctx())
    expect(r1.headers?.['Access-Control-Allow-Origin']).toBeUndefined()

    const enabled = api({
      http: { cors: { origin: 'web.mysite.com' } },
      handler: () => res.ok(),
    })

    const r2 = await enabled({ ...events.payloadV2 }, ctx())
    expect(r2.headers?.['Access-Control-Allow-Origin']).toBe('web.mysite.com')
  })
})
