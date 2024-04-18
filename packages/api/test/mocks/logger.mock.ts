import { Logger } from '@funcy/core/src/types'
import { vi } from 'vitest'

export const logger = (): Logger => ({
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
})
