import { Options as CorsOptions } from '@middy/http-cors'
import { FuncyOptions } from '@funcy/core'
import { APIGatewayProxyStructuredResultV2, Context } from 'aws-lambda'
import z from 'zod'

// allow void responses only if expecting void body type (if parsing a response type, then we shouldn't allow void)
export type ApiResultV2<TBody> = TBody extends void ? void : ApiResultV2WithContent<TBody>
export type ApiResultV2WithContent<TBody> = Omit<APIGatewayProxyStructuredResultV2, 'body'> & {
  body: TBody | undefined
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
  parser?: ZodParser<TResponse, TRequest, TPath, TQuery>

  /**
   * HTTP options
   */
  http?: {
    /**
     * CORS options
     */
    cors?: CorsOptions

    /**
     * Security Headers
     */
    security?: SecurityOptions

    /**
     * Encoding options
     */
    encoding?: EncodingOptions

    /**
     * Content options
     */
    content?: {
      /**
       * Content header options for the request
       */
      request?: RequestContentOptions

      /**
       * Content response serializers for the response
       */
      response?: ResponseContentOptions
    }
  }
}

/**
 * Configuration for Zod
 */
export type ZodParser<TResponse, TRequest, TPath, TQuery> = {
  request?: z.ZodSchema<TRequest>
  response?: z.ZodSchema<TResponse>
  path?: z.ZodSchema<TPath>
  query?: z.ZodSchema<TQuery>
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
