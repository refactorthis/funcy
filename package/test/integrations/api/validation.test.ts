import { describe, it, expect, vi } from 'vitest'
import { createApi, res } from 'package/src/integrations/api'
import * as events from '../../mocks/api-proxy-events'
import { ctx } from '../../mocks/lambda-context'
import z from 'zod'
import { APIGatewayProxyEventV2 } from 'aws-lambda'

// TODO fix typescript warnings here

const api = createApi()

describe('validation::request', () => {
  const fn = api({
    parser: {
      request: z.object({
        id: z.number(),
        name: z.string(),
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
      details: [{ path: ['body', 'name'], message: 'Required' }],
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
})

describe('validation::path', () => {
  const fn = api({
    parser: {
      path: z.object({
        id: z.string(),
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
      details: [{ path: ['path', 'id'], message: 'Required' }],
    })
  })

  it('should succeed if passes validation', async () => {
    const event: APIGatewayProxyEventV2 = {
      ...events.payloadV2,
      body: JSON.stringify({
        id: 1,
        name: 'Test',
      }),
      pathParameters: {
        id: '1',
      },
    }

    const response = await fn(event, ctx())
    expect(response.statusCode).toBe(200)
  })
})

describe('validation::querystring', () => {
  const fn = api({
    parser: {
      query: z.object({
        startDate: z.coerce.date(),
        endDate: z.coerce.date(),
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
      queryStringParameters: {
        startDate: '2021-01-01',
      },
    }

    const response = await fn(event, ctx())
    expect(response.statusCode).toBe(400)
    expect(JSON.parse(response.body!)).toMatchObject({
      message: 'Invalid Request',
      details: [{ path: ['querystring', 'endDate'], message: 'Invalid date' }],
    })
  })

  it('should succeed if passes validation', async () => {
    const event: APIGatewayProxyEventV2 = {
      ...events.payloadV2,
      body: JSON.stringify({
        id: 1,
        name: 'Test',
      }),
      queryStringParameters: {
        startDate: '2021-01-01',
        endDate: '2021-01-02',
      },
    }

    const response = await fn(event, ctx())
    expect(response.statusCode).toBe(200)
  })
})

describe('validation::response', () => {
  const fn = api({
    parser: {
      request: z.object({
        id: z.number(),
      }),
      response: z.object({
        id: z.string(),
        title: z.string(),
        due: z.date(),
      }),
    },
    handler: ({ request }) => {
      const response =
        request.id === 1 ?
          {
            id: '1',
            title: 'todo',
            due: new Date(),
          }
        : {}
      return res.ok(response)
    },
  })

  it("should fail with 500 if doesn't pass response validation", async () => {
    const event: APIGatewayProxyEventV2 = {
      ...events.payloadV2,
      body: JSON.stringify({
        id: 22,
      }),
    }

    const response = await fn(event, ctx())
    expect(response.statusCode).toBe(500)
    expect(JSON.parse(response.body!)).toMatchObject({
      message: 'Response object failed validation',
      details: expect.any(Array),
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

  it('should warn only if validateResponses is set to warn', async () => {
    const logSpy = vi.spyOn(console, 'warn')

    const fn = api({
      monitoring: {
        logger: () => console,
      },
      parser: {
        response: z.object({
          id: z.string(),
          title: z.string(),
          due: z.date(),
        }),
        validateResponses: 'warn',
      },
      handler: ({ request }) => {
        const response =
          request.id === 1 ?
            {
              id: '1',
              title: 'todo',
              due: new Date(),
            }
          : ({} as any)
        return res.ok(response)
      },
    })

    const event: APIGatewayProxyEventV2 = {
      ...events.payloadV2,
      body: JSON.stringify({
        id: 22,
      }),
    }

    const response = await fn(event, ctx())
    expect(logSpy).toHaveBeenCalled()
    expect(response.statusCode).toBe(200)
  })

  it('should not validate if validateResponses is set to never', async () => {
    const fn = api({
      parser: {
        response: z.object({
          id: z.string(),
          title: z.string(),
          due: z.date(),
        }),
        validateResponses: 'never',
      },
      handler: ({ request }) => {
        const response =
          request.id === 1 ?
            {
              id: '1',
              title: 'todo',
              due: new Date(),
            }
          : ({} as any)
        return res.ok(response)
      },
    })

    const event: APIGatewayProxyEventV2 = {
      ...events.payloadV2,
      body: JSON.stringify({
        id: 22,
      }),
    }

    const response = await fn(event, ctx())
    expect(response.statusCode).toBe(200)
  })
})
