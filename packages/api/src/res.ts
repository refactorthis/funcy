import { ApiResultV2 } from './types'

const response =
  () =>
  <TBody>(
    statusCode: number,
    body?: TBody,
    headers?: {
      [header: string]: string | number | boolean
    },
    cookies?: string[],
  ) =>
    ({ statusCode, body, headers, cookies }) as ApiResultV2<TBody>

// How to curry with generic type arg?
const status =
  (statusCode?: number) =>
  <TBody>(
    body?: TBody,
    headers?: {
      [header: string]: string | number | boolean
    },
    cookies?: string[],
  ) =>
    ({ statusCode, body, headers, cookies }) as ApiResultV2<TBody>

/**
 * Response helper utility.
 *
 * @example
 * ```
 * handler: async () => {
 *   return res.ok({ id: "123" })
 * }
 * ```
 *
 * This is a convenience utility. You don't need to use this, you can also return the ApiResultV2<TBody> struct
 */
export const res = {
  status: response(),
  ok: status(200),
  created: status(201),
  accepted: status(202),
  noContent: status(204),
  badRequest: status(400),
  notFound: status(404),
  conflict: status(409),
  unprocessable: status(422),
  tooManyRequests: status(429),
  serverError: status(500),
  notImplemented: status(501),
}
