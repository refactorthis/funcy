import { ApiResultV2 } from './types'

/**
 * Response helper utility.
 * Note: You can return ApiResultV2<TResponse> if you don't want to use this helper.
 */
export const res = {
  status: <TBody>(statusCode: number, body: TBody): ApiResultV2<TBody> => {
    return { statusCode, body }
  },
  ok: <TBody>(body: TBody): ApiResultV2<TBody> => {
    return { statusCode: 200, body }
  },
  created: <TBody>(body: TBody, location?: string): ApiResultV2<TBody> => {
    return { statusCode: 201, body, headers: location ? { Location: location } : undefined }
  },
  accepted: <TBody>(body: TBody, location?: string): ApiResultV2<TBody> => {
    return { statusCode: 202, body, headers: location ? { Location: location } : undefined }
  },
  noContent: <TBody>(body: TBody, location?: string): ApiResultV2<TBody> => {
    return { statusCode: 204, body, headers: location ? { Location: location } : undefined }
  },
  badRequest: <TError>(error: TError): ApiResultV2<TError> => {
    return { statusCode: 400, body: error }
  },
  notFound: <TError>(error: TError): ApiResultV2<TError> => {
    return { statusCode: 404, body: error }
  },
  conflict: <TError>(error: TError): ApiResultV2<TError> => {
    return { statusCode: 409, body: error }
  },
  unprocessable: <TError>(error: TError): ApiResultV2<TError> => {
    return { statusCode: 422, body: error }
  },
  tooManyRequests: <TError>(error: TError): ApiResultV2<TError> => {
    return { statusCode: 429, body: error }
  },
  serverError: <TError>(error: TError): ApiResultV2<TError> => {
    return { statusCode: 500, body: error }
  },
  notImplemented: <TError>(error: TError): ApiResultV2<TError> => {
    return { statusCode: 501, body: error }
  },
}
