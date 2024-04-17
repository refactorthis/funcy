import process from 'process'

const defaults = {
  logger: console,
}

interface MemorySnapshot {
  /**
   * Resident Set Size (total memory allocated)
   */
  rss: number

  /**
   * Size of allocated heap
   */
  heapTotal: number

  /**
   * Memory used during the execution
   */
  heapUsed: number

  /**
   * V8 external memory
   */
  external: number
}

const memorySnapshot = (): MemorySnapshot => {
  const { rss, heapTotal, heapUsed, external } = process.memoryUsage()
  return { rss, heapTotal, heapUsed, external }
}

const memoryDiff = (a: MemorySnapshot, b: MemorySnapshot) => {
  const formatMemory = (data: number) => `${Math.round((data / 1024 / 1024) * 100) / 100} MB`

  const diff = {
    rss: b.rss - a.rss,
    heapTotal: b.heapTotal - a.heapTotal,
    heapUsed: b.heapUsed - a.heapUsed,
    external: b.external - a.external,
  }

  return Object.entries(diff)
    .map(([key, value]) => `${key}: ${formatMemory(value)}`)
    .join(' | ')
}

export const profiler = (opts = {}) => {
  const { logger } = { ...defaults, ...opts }
  const store = new Map<string, any>()

  console.log('[Funcy] Profiling Enabled')

  const start = (id: string) => {
    store.set(id, { time: process.hrtime.bigint(), mem: memorySnapshot() })
  }

  const stop = (id: string) => {
    const item = store.get(id)
    const mem = memorySnapshot()

    const time = Number.parseInt((process.hrtime.bigint() - item.time).toString()) / 1000000
    logger.debug(id, time, 'ms')
    logger.debug(id, memoryDiff(item.mem, mem))
    store.delete(id)
  }

  return {
    beforePrefetch: () => start('total'),
    requestStart: () => {
      if (!store.has('init')) {
        store.set('init', store.get('total'))
        stop('init')
      } else {
        start('total')
      }
    },
    beforeMiddleware: start,
    afterMiddleware: stop,
    beforeHandler: () => start('handler'),
    afterHandler: () => stop('handler'),
    requestEnd: () => stop('total'),
  }
}
