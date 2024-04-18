import { describe, it, expect, vi } from 'vitest'
import { api } from '../src/api'
import { res } from '../src/res'
import * as events from './data/api-proxy-events'
import { ctx } from './data/lambda-context'
import { Logger } from '@funcy/core'

const sampleEvent = {
  ...events.payloadV2,
  headers: {},
  body: undefined,
}

describe('Monitoring -> Profiling', () => {
  it('should not profile if not enabled', async () => {
    const fn = api({ handler: () => res.ok() })
    const response = await fn(sampleEvent as any, ctx())
    console.log(response)
    expect(response.statusCode).toBe(200)
  })

  it('should output profile information if enabled', async () => {
    const logger = { debug: vi.fn(), error: vi.fn(), info: vi.fn() } as unknown as Logger
    const fn = api({
      monitoring: { logger: () => logger, enableProfiling: true },
      handler: () => res.ok(),
    })
    const response = await fn(sampleEvent as any, ctx())
    expect(response.statusCode).toBe(200)
    expect(logger.info).toHaveBeenCalledWith('[Funcy] Profiling Enabled')
    expect(logger.debug).toHaveBeenCalled()
  })
})
