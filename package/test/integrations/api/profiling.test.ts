import { describe, it, expect, vi } from 'vitest'
import { api, res } from 'package/src/integrations/api'
import * as events from '../../mocks/api-proxy-events'
import { ctx } from '../../mocks/lambda-context'
import type { Logger } from 'package/src/core'

const sampleEvent = {
  ...events.payloadV2,
  headers: {},
  body: undefined,
}

describe('Monitoring -> Profiling', () => {
  it('should not profile if not enabled', async () => {
    const fn = api({ handler: () => res.ok() })
    const response = await fn(sampleEvent, ctx())
    expect(response.statusCode).toBe(200)
  })

  it('should output profile information if enabled', async () => {
    const logger = { debug: vi.fn(), error: vi.fn(), info: vi.fn() } as unknown as Logger
    const fn = api({
      monitoring: { logger: () => logger, enableProfiling: true },
      handler: () => res.ok(),
    })
    const response = await fn(sampleEvent, ctx())
    expect(response.statusCode).toBe(200)
    expect(logger.info).toHaveBeenCalledWith('[Funcy] Profiling Enabled')
    expect(logger.debug).toHaveBeenCalled()
  })
})
