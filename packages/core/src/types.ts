import middy from '@middy/core'

/**
 * Funcy common options
 */
export interface FuncyOptions<TEvent, TResponse> {
  /**
   * Logging, Profiling & Metrics options
   */
  monitoring?: {
    /**
     * Logger to use
     * TODO: remove loglevel and make this have different functions for each level..
     *
     * @default console.log
     */
    logger?: (message: any) => void

    /**
     * The log level.
     * Debug will log all events and responses.
     *
     * @default 'info'
     */
    logLevel?: 'debug' | 'info' | 'error'

    /**
     * If true, will enable memory and stopwatch profiling of the pipeline.
     *
     * @default false
     */
    enableProfiling?: boolean

    /**
     * Options for Cloudwatch Metrics
     */
    cloudWatchMetrics?: CloudwatchMetricsOptions
  }

  /**
   * Settings for the lambda function
   */
  function?: {
    /**
     * Settings for enabling a no-op warmup function for this lambda.
     * @deprecated use provisioned concurrency instead
     */
    warmup?: WarmupOptions

    /**
     * Custom extensions to the middy pipeline.
     * See https://middy.js.org/ for more information
     */
    pipeline?: middy.MiddlewareObj<TEvent, TResponse>[]
  }
}

interface WarmupOptions {
  isWarmingUp?: (event: any) => boolean
  onWarmup?: (event: any) => void
}

interface CloudwatchMetricsOptions {
  namespace?: string
  dimensions?: Array<Record<string, string>>
}
