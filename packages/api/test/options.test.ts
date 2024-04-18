import { describe, it, expect, vi } from 'vitest'
import { createApi } from '../src/api'
import { Logger } from '@funcy/core/src/types'
import pipeline from '../src/middleware/api-pipeline'

vi.mock('../src/middleware/api-pipeline', () => ({
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
    const logger = { warn: () => {}, tim: () => {} } as unknown as Logger
    const api = createApi({
      monitoring: {
        logger: () => logger,
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
    expect(opts?.monitoring?.logger?.()).toBe(logger)
    expect(opts?.http?.cors?.origin).toBe('myorigin.com')
    expect(opts?.http?.cors?.origins).toStrictEqual(['one.com', 'two.com'])
  })
})
