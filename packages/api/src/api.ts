import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyEventPathParameters,
  APIGatewayProxyEventQueryStringParameters,
  APIGatewayEventDefaultAuthorizerContext,
} from 'aws-lambda'
import pipeline from './middleware/api-pipeline'
import { FuncyApiOptions, ApiResultV2 } from './types'
import { deepMerge } from '../../core/src/utility'

// TODO remove usage of class.

const defaultFuncyOptions: Omit<FuncyApiOptions, 'handler'> = {
  monitoring: {
    logLevel: 'info',
    logger: console,
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
 * const apiHandler = ApiHandlerBuilder<MyCustomAuthorizer, APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2>({
 *     middyPipeline: myCustomMiddyPipeline
 * })
 *
 * export const handler = apiHandler(async ({ request } => {})
 *
 * @param TAuthorizer The struct of the authorizer
 * @param TEvent The struct of the event
 * @param TResponse The struct of the response
 * @param opts default options for all handlers
 * @returns The api handler wrapper function
 */
export class FuncyApi<
  TAuthorizer = APIGatewayEventDefaultAuthorizerContext,
  TEvent = APIGatewayProxyEventV2,
> {
  private readonly opts: Omit<FuncyApiOptions<any, any, any, any, TAuthorizer, TEvent>, 'handler'>

  constructor(opts?: Omit<FuncyApiOptions<any, any, any, any, TAuthorizer, TEvent>, 'handler'>) {
    this.opts = deepMerge({}, defaultFuncyOptions, opts ?? {})
  }

  /**
   * Makes your API funcy-er
   */
  handler = <
    TResponse = any,
    TRequest = any,
    TPath = APIGatewayProxyEventPathParameters,
    TQuery = APIGatewayProxyEventQueryStringParameters,
  >(
    opts: FuncyApiOptions<TResponse, TRequest, TPath, TQuery, TAuthorizer, TEvent>,
  ) => {
    const props = Object.create(this.opts, Object.getOwnPropertyDescriptors(opts ?? {}))
    return pipeline<ApiResultV2<TResponse>, TEvent>(props).handler((event, context) => {
      // TODO hack - write proper type mappings for other use cases.
      const ev = event as APIGatewayProxyEventV2

      return props.handler({
        request: ev.body as TRequest,
        query: ev.queryStringParameters as TQuery,
        path: ev.pathParameters as TPath,
        event: ev as TEvent,
        authorizer: ev.requestContext?.authorizer as TAuthorizer,
        context,
      })
    })
  }
}

/**
 * Pre-built Api Handler using sensible defaults
 */
export const api = new FuncyApi().handler
