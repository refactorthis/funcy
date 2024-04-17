import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyEventPathParameters,
  APIGatewayProxyEventQueryStringParameters,
  APIGatewayEventDefaultAuthorizerContext,
} from 'aws-lambda'
import pipeline from './middleware/api-pipeline'
import { FuncyApiOptions, ApiResultV2 } from './types'
import merge from 'lodash.merge'

const defaultFuncyOptions: Omit<FuncyApiOptions, 'handler'> = {
  monitoring: {
    logLevel: 'info',
    logger: () => console,
    cloudWatchMetrics: false,
    enableProfiling: false,
  },
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
  apiOpts = merge({}, defaultFuncyOptions, apiOpts)

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

    return pipeline<ApiResultV2<TResponse>, TEvent>(opts).handler((event, context) => {
      // TODO hack - write proper type mappings for other use cases.
      const ev = event as APIGatewayProxyEventV2

      return opts.handler({
        request: ev.body as TRequest,
        query: ev.queryStringParameters as TQuery,
        path: ev.pathParameters as TPath,
        event: ev as TEvent,
        authorizer: (ev.requestContext as any)?.authorizer as TAuthorizer,
        context,
      })
    })
  }

  handler.defaultOptions = apiOpts
  return handler
}

// default
export const api = createApi()
