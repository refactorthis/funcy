import merge from 'lodash.merge'
import pipeline from './middleware/func.pipeline'
import { FuncOptions } from './types'
import { baseOptions } from 'package/src/core/defaults'

const defaults: Omit<FuncOptions<any, any>, 'handler'> = {
  ...baseOptions,
}

/**
 * Builds a lambda function handler with specified default options
 *
 * @example
 * const func = createFunc({
 *   monitoring: {
 *     cloudWatchMetrics: true,
 *   }
 * })
 *
 * export const handler = func(async ({ request } => {})
 *
 * @param TEvent The struct of the event
 * @param opts default options for all handlers
 * @returns The api handler wrapper function
 */
export const createFunc = <TEvent = any, TResult = any>(
  apiOpts?: Omit<FuncOptions<TEvent, TResult>, 'handler'>,
) => {
  apiOpts = merge({}, defaults, apiOpts)

  /**
   * funcy lambda function handler
   * @param opts funcy options
   * @returns wrapped handler
   */
  const handler = <TEvent = any, TResult = any>(opts: FuncOptions<TEvent, TResult>) => {
    opts = merge({}, apiOpts, opts)

    return pipeline(opts).handler((event, context) => {
      return opts.handler({
        event: event as TEvent,
        context,
      })
    })
  }

  handler.defaultOptions = apiOpts
  return handler
}

// default
export const func = createFunc()
