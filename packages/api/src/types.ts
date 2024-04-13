import { APIGatewayProxyStructuredResultV2, Context } from 'aws-lambda'
import { Options as CorsOptions } from '@middy/http-cors'
import middy from '@middy/core'
import z from 'zod'
import { FuncyOptions } from '../../core/src/types'
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
> extends FuncyOptions {
  /**
   * The strongly-typed lambda function handler
   */
  handler: ApiHandlerFunc<TResponse, TRequest, TPath, TQuery, TAuthorizer, TEvent>

  /**
   * Validators
   */
  validation?: ZodValidation<TResponse, TRequest, TPath, TQuery>

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

  /**
   * Used to interact with the underlying middy pipeline
   */
  middy?: {
    /**
     * Add the following middleware to the middy pipeline
     */
    extend?: middy.MiddlewareObj<TEvent, ApiResultV2<TResponse>>[]
  }
}

export type ApiResultV2<TBody> = Omit<APIGatewayProxyStructuredResultV2, 'body'> & {
  body: TBody
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
}) => Promise<ApiResultV2<TResponse>>

/**
 * Configuration for Zod validation
 */
export type ZodValidation<TResponse, TRequest, TPath, TQuery> = {
  type: 'zod'
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
