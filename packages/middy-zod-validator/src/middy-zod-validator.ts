import { MiddlewareObj } from '@middy/core'
import { ZodError, ZodSchema } from 'zod'
import { APIGatewayProxyEventV2 } from 'aws-lambda'

export default (
  bodySchema?: ZodSchema,
  pathSchema?: ZodSchema,
  querySchema?: ZodSchema,
): Required<Pick<MiddlewareObj<APIGatewayProxyEventV2, any>, 'before'>> => ({
  before: async (request) => {
    if (!bodySchema && !pathSchema && !querySchema) return

    try {
      await bodySchema?.parseAsync(request.event.body || {}, {
        path: ['body'],
      })
      await pathSchema?.parseAsync(request.event.pathParameters || {}, {
        path: ['path'],
      })
      await querySchema?.parseAsync(request.event.queryStringParameters || {}, {
        path: ['querystring'],
      })
    } catch (error) {
      request.response = {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Invalid Request',
          details: (error as ZodError).format(),
        }),
      }
    }
  },
})
