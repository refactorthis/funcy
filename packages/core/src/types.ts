/**
 * Funcy options base type
 */
export interface FuncyOptions {
  /**
   * Logger options
   */
  logger?: {
    /**
     * Logger to use
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
     * NOTE this has a performance impact, so don't use this in production
     *
     * @default false
     */
    enableProfiling?: boolean
  }
}
