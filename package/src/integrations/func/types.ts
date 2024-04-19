import { FuncyOptions } from 'package/src/core'
import { Context } from 'aws-lambda'

export type FuncHandler<TEvent, TResult, TContext extends Context> = ({
  event,
  context,
}: {
  event: TEvent
  context: TContext
}) => Promise<TResult> | TResult

export interface FuncOptions<TEvent, TResult, TContext extends Context = Context>
  extends FuncyOptions<TEvent, TResult> {
  handler: FuncHandler<TEvent, TResult, TContext>
}
