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
import middyZodValidator from './middy-zod-validator'

export default <TResponseStruct, TEvent>(opts?: FuncyApiOptions) => {
  const logger = opts?.monitoring?.logger ?? console

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
    .use(
      httpHeaderNormalizerMiddleware({
        defaultHeaders: { 'content-type': 'application/json', accept: 'application/json' },
      }),
    )
    .use(httpUrlencodePathParametersParserMiddleware())
    .use(httpContentNegotiationMiddleware(opts?.http?.content?.request))
    .use(httpJsonBodyParserMiddleware({ disableContentTypeError: true }))
    .use(httpMultipartBodyParserMiddleware({ disableContentTypeError: true }))
    .use(httpUrlencodeBodyParserMiddleware({ disableContentTypeError: true }))
    .use(httpSecurityHeadersMiddleware(opts?.http?.security))
    .use(httpCorsMiddleware(opts?.http?.cors))
    .use(httpContentEncodingMiddleware(opts?.http?.encoding))
    .use(httpResponseSerializerMiddleware(opts?.http?.content?.response))
    .use(warmupMiddleware(opts?.function?.warmup))

  if (opts?.monitoring?.cloudWatchMetrics)
    pipe.use(cloudWatchMetricsMiddleware(opts?.monitoring?.cloudWatchMetrics))

  if (opts?.monitoring?.logLevel === 'trace')
    pipe.use(inputOutputLoggerMiddleware({ logger: logger.trace }))

  if (opts?.parser)
    pipe.use(middyZodValidator(opts?.parser.request, opts?.parser?.path, opts?.parser.query))

  if (opts?.function?.pipeline) opts?.function?.pipeline.forEach((p) => pipe.use(p))

  pipe
    .use(errorLoggerMiddleware({ logger: logger.error }))
    .use(httpErrorHandlerMiddleware({ logger: logger.error }))
  return pipe
}
