import { describe, it, expect, vi } from 'vitest'
import { func } from 'package/src/integrations/func'
import * as events from '../../mocks/api-proxy-events'
import { ctx } from '../../mocks/lambda-context'
import { logger } from '../../mocks/logger.mock'

describe('func pipeline', () => {
  it('should enable full input/output logging if debug mode', async () => {
    const log = logger()
    const disabled = func({
      monitoring: { logger: () => log, logLevel: 'info' },
      handler: () => {},
    })

    await disabled({ ...events.payloadV2 }, ctx())
    expect(log.debug).not.toHaveBeenCalled()

    const enabled = func({
      monitoring: { logger: () => log, logLevel: 'debug' },
      handler: () => {},
    })

    await enabled({ ...events.payloadV2 }, ctx())
    expect(log.debug).toHaveBeenCalled()
  })

  // TODO Need to mock the embedded metrics provider
  it.skip('should enable cloudwatch metrics if specified', async () => {
    const disabled = func({
      handler: ({ context }) => ({ metrics: !!context.metrics }),
    })

    const r1 = await disabled({ ...events.payloadV2 }, ctx())
    expect(JSON.parse(r1.body!).metrics).toBeUndefined()

    const enabled = func({
      monitoring: { cloudWatchMetrics: { namespace: 'my-namespace' } },
      handler: ({ context }) => ({ metrics: !!context.metrics }),
    })

    const r2 = await enabled({ ...events.payloadV2 }, ctx())
    expect(JSON.parse(r2.body!).metrics).toBeDefined()
  })

  it('should add extra middleware to the pipeline if specified', async () => {
    const middleware = { before: vi.fn() }
    const fn = func({
      function: { middleware: [middleware] },
      handler: () => {},
    })

    await fn({ ...events.payloadV2 }, ctx())
    expect(middleware.before).toHaveBeenCalled()
  })
})
