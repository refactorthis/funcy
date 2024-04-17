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
     *
     * @default console
     */
    // When merging, lodash will attempt to merge console as an POJO, instead of assigning a new object.
    // Using a fn 'getter' to work around this problem.
    logger?: () => Logger

    /**
     * The log level.
     * Debug will log all events and responses.
     *
     * @default 'info'
     */
    logLevel?: 'trace' | 'info' | 'warn' | 'error'

    /**
     * If true, will enable memory and stopwatch profiling of the pipeline.
     *
     * @default false
     */
    enableProfiling?: boolean

    /**
     * Options for Cloudwatch Metrics. This will enable context.metrics in your handler.
     *
     * See https://middy.js.org/docs/middlewares/cloudwatch-metrics
     * @example
     * ```typescript
     * cloudwatchMetrics: {
     *   namespace: 'my-application-namespace'
     * }
     * ```
     * @default false
     */
    cloudWatchMetrics?: CloudwatchMetricsOptions | false
  }

  /**
   * Settings for the lambda function
   */
  function?: {
    /**
     * Settings for enabling a no-op warmup function for this lambda.
     *
     * See https://middy.js.org/docs/middlewares/warmup
     * @deprecated use provisioned concurrency instead
     */
    warmup?: WarmupOptions

    /**
     * Custom extensions to the middy pipeline.
     *
     * funcy already handles best practice middleware by default.
     * This property allows you to add your own custom middy.js middleware
     * to the pipeline.
     *
     * See https://middy.js.org/ for more information
     */
    middleware?: middy.MiddlewareObj<TEvent, TResponse>[]

    /**
     * Error handler
     * // TODO
     */
    onError: (error: any) => void
  }
}

export interface Logger {
  trace: (message: any) => void
  info: (message: any) => void
  warn: (message: any) => void
  error: (message: any) => void
}

interface WarmupOptions {
  isWarmingUp?: (event: any) => boolean
  onWarmup?: (event: any) => void
}

interface CloudwatchMetricsOptions {
  namespace?: string
  dimensions?: Array<Record<string, string>>
}
