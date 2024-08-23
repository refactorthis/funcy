import { it, expect } from 'vitest'
import { createApi, res } from 'package/src/integrations/api'
import * as events from '../../mocks/api-proxy-events'
import { ctx } from '../../mocks/lambda-context'
import { object, number, string } from 'joi'
import { APIGatewayProxyEventV2 } from 'aws-lambda'

const api = createApi()

const fn = api({
  parser: {
    request: object({
      id: number().required(),
      name: string().required(),
    }),
  },
  handler: () => res.ok(),
})

it("should fail if doesn't pass validation", async () => {
  const event: APIGatewayProxyEventV2 = {
    ...events.payloadV2,
    body: JSON.stringify({
      id: 1,
    }),
  }

  const response = await fn(event, ctx())
  expect(response.statusCode).toBe(400)
  expect(JSON.parse(response.body!)).toMatchObject({
    message: 'Invalid Request',
    details: ['"name" is required'],
  })
})

it('should succeed if passes validation', async () => {
  const event: APIGatewayProxyEventV2 = {
    ...events.payloadV2,
    body: JSON.stringify({
      id: 1,
      name: 'Test',
    }),
  }

  const response = await fn(event, ctx())
  expect(response.statusCode).toBe(200)
})
