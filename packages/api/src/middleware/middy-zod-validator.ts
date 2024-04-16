import { MiddlewareObj } from '@middy/core'
import { ZodError, ZodSchema } from 'zod'
import { APIGatewayProxyEventV2 } from 'aws-lambda'

// This will be refactored in a subsequent commit to remove and allow multiple validation frameworks.

export default (
  request?: ZodSchema,
  path?: ZodSchema,
  query?: ZodSchema,
): Required<Pick<MiddlewareObj<APIGatewayProxyEventV2, any>, 'before'>> => ({
  before: async (req) => {
    if (!req && !path && !query) return

    try {
      await request?.parseAsync(req.event.body || {}, {
        path: ['body'],
      })
      await path?.parseAsync(req.event.pathParameters || {}, {
        path: ['path'],
      })
      await query?.parseAsync(req.event.queryStringParameters || {}, {
        path: ['querystring'],
      })
    } catch (error) {
      req.response = {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Invalid Request',
          details: (error as ZodError).format(),
        }),
      }
    }
  },
})
