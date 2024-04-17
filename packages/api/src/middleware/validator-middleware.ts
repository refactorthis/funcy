import { MiddlewareObj, Request } from '@middy/core'
import { createError } from '@middy/util'
import { APIGatewayProxyEventV2, Context } from 'aws-lambda'
import { ApiParser } from '../parsers'
import { Logger } from 'packages/core/src/types'

const defaults = {
  logger: console,
}

/**
 * This parser uses duck types and known signatures to find the appropriate validation
 * function and call it. Thus, does not need to have validation deps.
 */
export default <TResponse, TRequest, TPath, TQuery>(opts?: {
  parser?: ApiParser<TResponse, TRequest, TPath, TQuery>
  logger?: Logger
}): Required<Pick<MiddlewareObj<APIGatewayProxyEventV2, any>, 'before' | 'after'>> => {
  const { parser, logger } = { ...defaults, ...opts }

  return {
    before: async (req) => {
      if (!parser) return

      try {
        await validate(parser.request, req.event.body, ['body'])
        await validate(parser.path, req.event.pathParameters, ['path'])
        await validate(parser.query, req.event.queryStringParameters, ['querystring'])
      } catch (error: any) {
        throw createError(
          400,
          JSON.stringify({
            message: 'Invalid Request',
            details: error.errors,
          }),
          {
            cause: error,
          },
        )
      }
    },
    after: async (request: Request<APIGatewayProxyEventV2, any, Error, Context, {}>) => {
      if (!parser?.response || parser.validateResponses === 'never') return

      try {
        await validate(parser.response, request.response.body, ['response'])
      } catch (error: any) {
        if (parser.validateResponses === 'warn') {
          logger.warn(new Error('WARN: Response object failed validation', { cause: error }))
        } else if (parser.validateResponses === 'error') {
          throw createError(
            500,
            JSON.stringify({
              message: 'Response object failed validation',
              details: error.errors,
            }),
            {
              cause: error,
              expose: true, // TODO do we want to expose these details?
            },
          )
        }
      }
    },
  }
}

const validate = async (schema: any, value: any, path: string[]) => {
  if (!schema) return

  // zod
  if (typeof schema.parseAsync === 'function') {
    return await schema.parseAsync(value, { path })
  }

  throw new Error(`Unable to find validator function for schema ${schema}`)
}
