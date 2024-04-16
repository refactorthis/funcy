//import memwatch from '@airbnb/node-memwatch'

const defaults = {
  logger: console.log,
}

export default (opts = {}) => {
  const { logger } = { ...defaults, ...opts }
  const store = new Map<string, any>()

  const start = (id: string) => {
    store.set(id, { time: process.hrtime.bigint(), mem: null }) // new memwatch.HeapDiff() })
  }
  const stop = (id: string) => {
    const item = store.get(id)
    logger(id, Number.parseInt((process.hrtime.bigint() - item.time).toString()) / 1000000, 'ms')
    logger(id, null) // item.mem.end())
  }

  // Only run during cold start
  const beforePrefetch = () => start('total')
  const requestStart = () => {
    if (!store.has('init')) {
      store.set('init', store.get('total'))
      stop('init')
    } else {
      start('total')
    }
  }
  const beforeMiddleware = start
  const afterMiddleware = stop
  const beforeHandler = () => start('handler')
  const afterHandler = () => stop('handler')
  const requestEnd = () => stop('total')

  return {
    beforePrefetch,
    requestStart,
    beforeMiddleware,
    afterMiddleware,
    beforeHandler,
    afterHandler,
    requestEnd,
  }
}
