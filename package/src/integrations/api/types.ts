import { Options as CorsOptions } from '@middy/http-cors'
import { Context, FuncyOptions } from '@core'
import { APIGatewayProxyStructuredResultV2 } from 'aws-lambda'
// WORKAROUND: Found a strange behaviour where linking via alias will break implicit typing..
import { Schema } from '../../core/parsers'

//export type APIGatewayResult = APIGatewayProxyStructuredResultV2 | APIGatewayProxyResult

export type ApiResultV2<TBody> = Omit<APIGatewayProxyStructuredResultV2, 'body'> & {
  body?: TBody | undefined
}

export type ApiHandlerFunc<TResponse, TRequest, TPath, TQuery, TAuthorizer, TEvent> = ({
  request,
  query,
  path,
  event,
}: {
  request: TRequest
  query: TQuery
  path: TPath
  event: TEvent
  authorizer: TAuthorizer
  context: Context
}) => Promise<ApiResultV2<TResponse>> | ApiResultV2<TResponse>

/**
 * Configuration options for funcy api handlers
 */
export interface FuncyApiOptions<
  TResponse = any,
  TRequest = any,
  TPath = any,
  TQuery = any,
  TAuthorizer = any,
  TEvent = any,
> extends FuncyOptions<TEvent, ApiResultV2<TResponse>> {
  /**
   * The strongly-typed lambda function handler. This is where your code belongs.
   *
   * @example
   * ```typescript
   * // create
   * handler: async ({ request }) => {
   *   const response = Customers.create(request)
   *   return res.created(response)
   * }
   *
   * // list
   * handler: async ({ query, authorizer }) => {
   *   const { skip, take } = query
   *   const items = Customers.list(authorizer.jwt.claims.tenantId, skip, take)
   *   return res.ok({ items })
   * }
   * ```
   */
  handler: ApiHandlerFunc<TResponse, TRequest, TPath, TQuery, TAuthorizer, TEvent>

  /**
   * API Parser configuration
   *
   * This has two aims.
   *  - infer the type of each input and output, so that they are strongly typed
   *  - validate the input and output at runtime
   *
   * @example
   * ```typescript
   * const CustomerRequest = z.object({ title: z.string(), description: z.string() })
   * const CustomerResponse = z.object({ id: z.string(), title: z.string(), description: z.string() })
   *
   * parser: {
   *   request: CustomerRequest,
   *   response: CustomerResponse,
   *   path: z.object({ id: z.string() }),
   * }
   * ```
   */
  parser?: ApiParser<TResponse, TRequest, TPath, TQuery>

  /**
   * HTTP options
   */
  http?: {
    /**
     * CORS options
     *
     * WARN: ensure you override 'origin', as middy defaults to '*'
     *
     * See https://middy.js.org/docs/middlewares/http-cors
     */
    cors?: CorsOptions

    /**
     * Security Headers
     *
     * See https://middy.js.org/docs/middlewares/http-security-headers
     */
    security?: SecurityOptions

    /**
     * Encoding options
     *
     * See https://middy.js.org/docs/middlewares/http-content-encoding
     */
    encoding?: EncodingOptions

    /**
     * Content options
     */
    content?: {
      /**
       * Content header options for the request
       *
       * See https://middy.js.org/docs/middlewares/http-content-negotiation
       */
      request?: RequestContentOptions

      /**
       * Content response serializers for the response
       *
       * See https://middy.js.org/docs/middlewares/http-response-serializer
       */
      response?: ResponseContentOptions
    }
  }
}

/**
 * Api parsing options
 */
export interface ApiParser<TResponse, TRequest, TPath, TQuery> {
  /**
   * Request body parser
   */
  request?: Schema<TRequest>

  /**
   * Response parser.
   *
   * If you would like to skip runtime validation of this schema, set the validateResponses property to false.
   *
   * @example
   * ```typescript
   * parser: {
   *   response: z.object({})
   * }
   * ```
   */
  response?: Schema<TResponse>

  /**
   * URI path parser
   */
  path?: Schema<TPath>

  /**
   * URI querystring parser
   */
  query?: Schema<TQuery>

  /**
   * Response validation setting
   *
   *  - 'never' - do not perform response validation
   *  - 'warn' - log warning and proceed
   *  - 'error' - raise 500 error
   *
   * @default 'error'
   */
  validateResponses?: 'never' | 'warn' | 'error'
}

// NOTE: Not exported from middy packages
interface SecurityOptions {
  dnsPrefetchControl?: {
    allow?: boolean
  }
  frameOptions?: {
    action?: string
  }
  poweredBy?: {
    server: string
  }
  strictTransportSecurity?: {
    maxAge?: number
    includeSubDomains?: boolean
    preload?: boolean
  }
  downloadOptions?: {
    action?: string
  }
  contentTypeOptions?: {
    action?: string
  }
  originAgentCluster?: boolean
  referrerPolicy?: {
    policy?: string
  }
  xssProtection?: {
    reportUri?: string
  }
  contentSecurityPolicy?: Record<string, string>
  crossOriginEmbedderPolicy?: {
    policy?: string
  }
  crossOriginOpenerPolicy?: {
    policy?: string
  }
  crossOriginResourcePolicy?: {
    policy?: string
  }
  permissionsPolicy?: Record<string, string>
  permittedCrossDomainPolicies?: {
    policy?: string
  }
  reportTo?: {
    maxAge?: number
    default?: string
    includeSubdomains?: boolean
    csp?: string
    staple?: string
    xss?: string
  }
}

interface EncodingOptions {
  br?: any
  gzip?: any
  deflate?: any
  overridePreferredEncoding?: string[]
}

interface RequestContentOptions {
  parseCharsets?: boolean
  availableCharsets?: string[]
  parseEncodings?: boolean
  availableEncodings?: string[]
  parseLanguages?: boolean
  availableLanguages?: string[]
  parseMediaTypes?: boolean
  availableMediaTypes?: string[]
  failOnMismatch?: boolean
}

interface ResponseContentSerializerHandler {
  regex: RegExp
  serializer: (response: any) => string | { body: any; [key: string]: any }
}

interface ResponseContentOptions {
  serializers: ResponseContentSerializerHandler[]
  defaultContentType?: string
}
