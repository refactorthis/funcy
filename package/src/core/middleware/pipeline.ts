import middy from '@middy/core'
import errorLoggerMiddleware from '@middy/error-logger'
import inputOutputLoggerMiddleware from '@middy/input-output-logger'
import warmupMiddleware from '@middy/warmup'
import cloudWatchMetricsMiddleware from '@middy/cloudwatch-metrics'
import { FuncyOptions } from '../types'
import { profiler } from 'package/src/core'

export type PipelinePlugin<TOptions extends FuncyOptions> = (
  pipe: middy.MiddyfiedHandler,
  opts: TOptions,
) => void

export const createPipeline = <TOptions extends FuncyOptions>(
  pipeline: PipelinePlugin<TOptions>,
  opts: TOptions,
) => {
  const logger = opts?.monitoring?.logger?.() ?? console

  const pipe = middy({
    ...(opts?.monitoring?.enableProfiling ? profiler({ logger }) : {}),
    timeoutEarlyResponse: () => ({ statusCode: 408 }),
  })

  pipe.use(warmupMiddleware(opts?.function?.warmup))

  if (opts?.monitoring?.logLevel === 'debug')
    pipe.use(inputOutputLoggerMiddleware({ logger: logger.debug }))

  if (opts?.monitoring?.cloudWatchMetrics)
    pipe.use(cloudWatchMetricsMiddleware(opts?.monitoring?.cloudWatchMetrics))

  pipeline(pipe, opts)

  pipe.use(errorLoggerMiddleware({ logger: logger.error }))
  return pipe
}
