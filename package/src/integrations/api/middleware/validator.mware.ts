import { MiddlewareObj, Request } from '@middy/core'
import { createError } from '@middy/util'
import { APIGatewayProxyEventV2, Context } from 'aws-lambda'
import { Logger } from 'package/src/core'
import { ApiParser } from 'package/src/core/parsers'

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
            details:
              error.errors /* yup zod */ || error.details?.flatMap((p) => p.message) /* joi */,
          }),
          {
            cause: error,
          },
        )
      }
    },
    after: async (
      request: Request<APIGatewayProxyEventV2, any, Error, Context, Record<string, unknown>>,
    ) => {
      if (!parser?.response || parser.validateResponses === 'never') return

      try {
        await validate(parser.response, request.response.body, ['response'])
      } catch (error: any) {
        if (parser.validateResponses === 'warn') {
          logger.warn(new Error('WARN: Response object failed validation', { cause: error }))
          return
        }

        if (parser.validateResponses === 'error') {
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

        throw error
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

  // joi
  if (typeof schema.validateAsync === 'function') {
    return await schema.validateAsync(value)
  }

  // yup
  if (typeof schema.validate === 'function') {
    return await schema.validate(value)
  }

  throw new Error(`Unable to find validator function for schema ${schema}`)
}
