/**
 * Schema parsing / validation types
 * We use duck typing here, so that we don't need to pull in the package deps.
 */

export type ZodSchemaLike<TInput> = {
  _input: TInput
  parseAsync(...args: any[]): any
}

export type YupSchemaLike<TInput> = {
  validate(value: unknown, options?: any): Promise<TInput>
}

export type Schema<T> = ZodSchemaLike<T> | YupSchemaLike<T>
