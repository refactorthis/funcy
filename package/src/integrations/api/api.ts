import type {
  APIGatewayProxyEventPathParameters,
  APIGatewayProxyEventQueryStringParameters,
  APIGatewayEventDefaultAuthorizerContext,
  APIGatewayProxyEventV2,
} from 'aws-lambda'
import pipeline from './middleware/api.pipeline'
import { FuncyApiOptions } from './types'
import merge from 'lodash.merge'
import { baseOptions } from 'package/src/core/defaults'

const defaults: Omit<FuncyApiOptions, 'handler'> = {
  ...baseOptions,
  parser: {
    validateResponses: 'error',
  },
  http: {
    content: {
      request: {
        availableMediaTypes: ['application/json'],
      },
      response: {
        serializers: [
          {
            regex: /^application\/json$/,
            serializer: ({ body }) => JSON.stringify(body),
          },
        ],
        defaultContentType: 'application/json',
      },
    },
  },
}

/**
 * Builds an api handler with specified types and options
 *
 * @example
 * const api = createApi<MyCustomAuthorizer>({
 *   http: {
 *     cors: {
 *       allow: ["*"]
 *     }
 *   }
 * })
 *
 * export const handler = api(async ({ request } => {})
 *
 * @param TAuthorizer The struct of the authorizer
 * @param TEvent The struct of the event
 * @param TResponse The struct of the response
 * @param opts default options for all handlers
 * @returns The api handler wrapper function
 */
export const createApi = <
  TAuthorizer = APIGatewayEventDefaultAuthorizerContext,
  TEvent = APIGatewayProxyEventV2,
>(
  apiOpts?: Omit<FuncyApiOptions<any, any, any, any, TAuthorizer, TEvent>, 'handler'>,
) => {
  apiOpts = merge({}, defaults, apiOpts)

  /**
   * funcy api handler
   * @param opts funcy options
   * @returns wrapped handler
   */
  const handler = <
    TResponse = any,
    TRequest = any,
    TPath = APIGatewayProxyEventPathParameters,
    TQuery = APIGatewayProxyEventQueryStringParameters,
  >(
    opts: FuncyApiOptions<TResponse, TRequest, TPath, TQuery, TAuthorizer, TEvent>,
  ) => {
    opts = merge({}, apiOpts, opts)
    console.log(opts)

    return pipeline<TResponse, TRequest, TPath, TQuery, TAuthorizer>(opts).handler(
      (ev, context) => {
        const event = ev as APIGatewayProxyEventV2
        return opts.handler({
          request: event.body as TRequest,
          query: event.queryStringParameters as TQuery,
          path: event.pathParameters as TPath,
          event: event as TEvent,
          authorizer: (event.requestContext as any)?.authorizer as TAuthorizer,
          context,
        })
      },
    )
  }

  handler.defaultOptions = apiOpts
  return handler
}

// default
export const api = createApi()
