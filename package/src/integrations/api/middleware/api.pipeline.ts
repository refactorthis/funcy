import { ApiResultV2, FuncyApiOptions } from '../types'
import validator from './validator.mware'
import { createPipeline } from '@core/middleware/pipeline'
import { MiddyfiedHandler } from '@middy/core'
import { Context } from '@core/types'

// middy middleware
import httpContentNegotiationMiddleware from '@middy/http-content-negotiation'
import httpContentEncodingMiddleware from '@middy/http-content-encoding'
import httpCorsMiddleware from '@middy/http-cors'
import httpErrorHandlerMiddleware from '@middy/http-error-handler'
import httpEventNormalizerMiddleware from '@middy/http-event-normalizer'
import httpHeaderNormalizerMiddleware from '@middy/http-header-normalizer'
import httpJsonBodyParserMiddleware from '@middy/http-json-body-parser'
import httpMultipartBodyParserMiddleware from '@middy/http-multipart-body-parser'
import httpUrlencodeBodyParserMiddleware from '@middy/http-urlencode-body-parser'
import httpResponseSerializerMiddleware from '@middy/http-response-serializer'
import httpSecurityHeadersMiddleware from '@middy/http-security-headers'
import httpUrlencodePathParametersParserMiddleware from '@middy/http-urlencode-path-parser'

export default <TResponse, TRequest, TPath, TQuery, TAuthorizer>(
  opts: FuncyApiOptions<TResponse, TRequest, TPath, TQuery, TAuthorizer>,
): MiddyfiedHandler<any, ApiResultV2<TResponse>, Error, Context> => {
  const logger = opts.monitoring?.logger?.() ?? console

  return createPipeline((pipe) => {
    pipe
      .use(httpEventNormalizerMiddleware())
      .use(httpHeaderNormalizerMiddleware())
      .use(httpUrlencodePathParametersParserMiddleware())
      .use(httpContentNegotiationMiddleware(opts?.http?.content?.request))
      .use(httpJsonBodyParserMiddleware({ disableContentTypeError: true }))
      .use(httpMultipartBodyParserMiddleware({ disableContentTypeError: true }))
      .use(httpUrlencodeBodyParserMiddleware({ disableContentTypeError: true }))
      .use(httpContentEncodingMiddleware(opts?.http?.encoding))
      .use(httpResponseSerializerMiddleware(opts?.http?.content?.response))

    if (opts?.http?.security) pipe.use(httpSecurityHeadersMiddleware(opts?.http?.security))
    if (opts?.http?.cors) pipe.use(httpCorsMiddleware(opts?.http?.cors))
    if (opts?.parser) pipe.use(validator({ parser: opts?.parser, logger }))
    if (opts?.function?.middleware) opts?.function?.middleware.forEach((p) => pipe.use(p))

    pipe.use(httpErrorHandlerMiddleware({ logger: logger.error }))
  }, opts)
}
