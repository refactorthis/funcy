import { createPipeline } from 'package/src/core/middleware/pipeline'
import { FuncOptions } from '../types'
import { Context } from 'aws-lambda'

export default <TEvent, TResult, TContext extends Context>(
  opts: FuncOptions<TEvent, TResult, TContext>,
) => {
  return createPipeline((pipe) => {
    if (opts?.function?.middleware) opts?.function?.middleware.forEach((p) => pipe.use(p))
  }, opts)
}
