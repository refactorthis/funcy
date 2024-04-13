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
import { FuncyApiOptions } from './types'
import middyZodValidator from '../../middy-zod-validator/src/middy-zod-validator'
import { profilingPlugin } from '../../core/src/debug'

export const middyPipeline = <TResponseStruct, TEvent>(opts?: FuncyApiOptions) => {
  const logger = opts?.logger?.logger ?? console.log

  let pipe = middy<TEvent, TResponseStruct>(
    {
      timeoutEarlyResponse: () => {
        return {
          statusCode: 408,
        }
      },
    },
    opts?.logger?.enableProfiling ? profilingPlugin({ logger }) : undefined,
  )
    .use(httpEventNormalizerMiddleware())
    .use(httpHeaderNormalizerMiddleware())
    .use(httpUrlencodePathParametersParserMiddleware())
    .use(httpContentNegotiationMiddleware(opts?.http?.content?.request))
    .use(httpJsonBodyParserMiddleware({ disableContentTypeError: true }))
    .use(httpMultipartBodyParserMiddleware({ disableContentTypeError: true }))
    .use(httpUrlencodeBodyParserMiddleware({ disableContentTypeError: true }))
    .use(httpSecurityHeadersMiddleware(opts?.http?.security))
    .use(httpCorsMiddleware(opts?.http?.cors))
    .use(httpContentEncodingMiddleware(opts?.http?.encoding)) // check
    .use(httpResponseSerializerMiddleware(opts?.http?.content?.response))

  if (opts?.logger?.logLevel === 'debug') {
    pipe.use(inputOutputLoggerMiddleware({ logger }))
  }

  if (opts?.validation?.type === 'zod') {
    pipe.use(
      middyZodValidator(opts?.validation.request, opts?.validation.path, opts?.validation.query),
    )
  }

  if (opts?.middy?.extend) {
    opts.middy.extend.forEach((p) => pipe.use(p))
  }

  pipe.use(errorLoggerMiddleware({ logger })).use(httpErrorHandlerMiddleware({ logger }))
  return pipe
}
