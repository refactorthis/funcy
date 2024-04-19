import { describe, it, expect, vi } from 'vitest'
import { createApi } from 'package/src/integrations/api'
import pipeline from 'package/src/integrations/api/middleware/api.pipeline'
import { logger } from '../../mocks/logger.mock'

vi.mock('@api/middleware/api.pipeline', () => ({
  default: vi.fn().mockReturnValue({ handler: () => {} }),
}))

describe('options', () => {
  it('should use default options if none specified', () => {
    const api = createApi()
    expect(api.defaultOptions.monitoring?.logLevel).toBe('info')
  })

  it('should merge & override defaults with api level options if specified', () => {
    const api = createApi({
      monitoring: {
        logLevel: 'debug',
      },
      http: {
        cors: {
          origin: 'myorigin.com',
        },
      },
    })
    expect(api.defaultOptions.monitoring?.logLevel).toBe('debug')
    expect(api.defaultOptions.http?.cors?.origin).toBe('myorigin.com')
  })

  it('should merge & override api level options with handler options if specified', () => {
    const log = logger()
    const api = createApi({
      monitoring: {
        logger: () => log,
        logLevel: 'error',
      },
      http: {
        cors: {
          origin: 'myorigin.com',
          origins: ['test.com'],
        },
      },
    })

    api({
      http: {
        cors: {
          origins: ['one.com', 'two.com'],
        },
      },
      handler: () => {
        return {
          statusCode: 200,
          body: {},
        }
      },
    })

    const opts = vi.mocked(pipeline).mock.lastCall?.[0]

    expect(opts?.monitoring?.logLevel).toBe('error')
    expect(opts?.monitoring?.logger?.()).toBe(log)
    expect(opts?.http?.cors?.origin).toBe('myorigin.com')
    expect(opts?.http?.cors?.origins).toStrictEqual(['one.com', 'two.com'])
  })
})
