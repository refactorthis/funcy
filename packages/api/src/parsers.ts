/**
 * parsers.ts
 *
 * Schema parsing / validation types
 * We use duck typing here, so that we don't need to pull in the package deps.
 */

// zod
export type ZodSchemaLike<TInput> = {
  _input: TInput
  parseAsync(...args: any[]): any
}

export type Schema<T> = ZodSchemaLike<T> // add other parsers here, eg. | YupSchemaLike<T>

/**
 * Api parsing options
 */
export type ApiParser<TResponse, TRequest, TPath, TQuery> = {
  /**
   * Request body parser
   */
  request?: Schema<TRequest>

  /**
   * Response parser.
   *
   * If you would like to skip runtime validation of this schema, set the validateResponses property to false.
   *
   * @example
   * ```typescript
   * parser: {
   *   response: z.object({})
   * }
   * ```
   */
  response?: Schema<TResponse>

  /**
   * URI path parser
   */
  path?: Schema<TPath>

  /**
   * URI querystring parser
   */
  query?: Schema<TQuery>

  /**
   * Response validation setting
   *
   *  - 'never' - do not perform response validation
   *  - 'warn' - log warning and proceed
   *  - 'error' - raise 500 error
   *
   * @default 'error'
   */
  validateResponses?: 'never' | 'warn' | 'error'
}
