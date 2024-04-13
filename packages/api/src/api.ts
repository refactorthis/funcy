import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyEventPathParameters,
  APIGatewayProxyEventQueryStringParameters,
  APIGatewayEventDefaultAuthorizerContext,
} from 'aws-lambda'
import { FuncyApiOptions, ApiResultV2 } from './types'
import { middyPipeline } from './pipeline'

const defaultFuncyOptions: Omit<FuncyApiOptions, 'handler'> = {
  logger: {
    logLevel: 'info',
    logger: (message) => console.log(message),
    enableProfiling: false,
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
  private readonly opts

  constructor(opts?: Omit<FuncyApiOptions<any, any, any, any, TAuthorizer, TEvent>, 'handler'>) {
    this.opts = Object.create(defaultFuncyOptions, Object.getOwnPropertyDescriptors(opts ?? {}))
  }

  /**
   * Wraps your lambda function with middy, zod validation and a strongly typed, functional interface
   *
   * @example
   * export const handler = apiHandler<CreateCustomerResponse, CreateCustomerRequest>(async ({ request } => {
   *     const customer = createCustomer(request)
   *     return { statusCode: 200, body: customer }
   * }
   *
   * @param TResponse the response type
   * @param TRequest the request type
   * @param TPath the path type
   * @param TQuery the query type
   * @param handler the lambda function handler
   * @param opts options
   */
  handler = <
    TResponse = void,
    TRequest = any,
    TPath = APIGatewayProxyEventPathParameters,
    TQuery = APIGatewayProxyEventQueryStringParameters,
  >(
    opts: FuncyApiOptions<TResponse, TRequest, TPath, TQuery, TAuthorizer, TEvent>,
  ) => {
    const props = Object.create(this.opts, Object.getOwnPropertyDescriptors(opts ?? {}))

    return middyPipeline<ApiResultV2<TResponse>, TEvent>(props).handler((event, context) => {
      // TODO hack - write proper type mappings for other use cases.
      const ev = event as APIGatewayProxyEventV2

      return props.handler({
        request: ev.body as TRequest,
        query: ev.queryStringParameters as TQuery,
        path: ev.pathParameters as TPath,
        event: ev as TEvent,
        authorizer: ev.requestContext.authorizer as TAuthorizer,
        context,
      })
    })
  }

  // Convenience methods
  get = <
    TResponse = void,
    TPath = APIGatewayProxyEventPathParameters,
    TQuery = APIGatewayProxyEventQueryStringParameters,
  >(
    opts: FuncyApiOptions<TResponse, never, TPath, TQuery, TAuthorizer, TEvent>,
  ) => {
    return this.handler(opts)
  }
}

/**
 * Pre-built Api Handler using sensible defaults
 */
export const funcy = new FuncyApi()
