import middy from '@middy/core'
import errorLoggerMiddleware from '@middy/error-logger'
import inputOutputLoggerMiddleware from '@middy/input-output-logger'
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
import warmupMiddleware from '@middy/warmup'
import cloudWatchMetricsMiddleware from '@middy/cloudwatch-metrics'
import profiler from '@funcy/core/src/middleware/profiler.plugin'
import { FuncyApiOptions } from '../types'
import validator from './validator-middleware'

export default <TResponseStruct, TEvent>(opts?: FuncyApiOptions) => {
  const logger = opts?.monitoring?.logger?.() ?? console

  let pipe = middy<TEvent, TResponseStruct>(
    {
      timeoutEarlyResponse: () => {
        return {
          statusCode: 408,
        }
      },
    },
    opts?.monitoring?.enableProfiling ? profiler({ logger }) : undefined,
  )
    .use(httpEventNormalizerMiddleware())
    .use(httpHeaderNormalizerMiddleware())
    .use(httpUrlencodePathParametersParserMiddleware())
    .use(httpContentNegotiationMiddleware(opts?.http?.content?.request))
    .use(httpJsonBodyParserMiddleware({ disableContentTypeError: true }))
    .use(httpMultipartBodyParserMiddleware({ disableContentTypeError: true }))
    .use(httpUrlencodeBodyParserMiddleware({ disableContentTypeError: true }))
    .use(httpSecurityHeadersMiddleware(opts?.http?.security))
    .use(httpContentEncodingMiddleware(opts?.http?.encoding))
    .use(httpResponseSerializerMiddleware(opts?.http?.content?.response))
    .use(warmupMiddleware(opts?.function?.warmup))

  if (opts?.monitoring?.cloudWatchMetrics)
    pipe.use(cloudWatchMetricsMiddleware(opts?.monitoring?.cloudWatchMetrics))

  if (opts?.monitoring?.logLevel === 'trace')
    pipe.use(inputOutputLoggerMiddleware({ logger: logger.trace }))

  if (opts?.http?.cors) pipe.use(httpCorsMiddleware(opts?.http?.cors))
  if (opts?.parser) pipe.use(validator({ parser: opts?.parser }))
  if (opts?.function?.middleware) opts?.function?.middleware.forEach((p) => pipe.use(p))

  pipe
    .use(errorLoggerMiddleware({ logger: logger.error }))
    .use(httpErrorHandlerMiddleware({ logger: logger.error }))
  return pipe
}
