import { describe, it, expect } from 'vitest'
import { res } from '..'

describe('response helper (res)', () => {
  it('should map a variable status code', () => {
    const response = res.status(
      200,
      {
        id: 'test',
      },
      {
        headers: {
          'x-powered-by': 'funcy',
        },
      },
    )

    expect(response).toMatchObject({
      statusCode: 200,
      body: { id: 'test' },
      headers: { 'x-powered-by': 'funcy' },
    })
  })

  it('should map a convenience status code', () => {
    const response = res.created(
      {
        id: 'test',
      },
      {
        headers: {
          Location: 'https://myurl.com',
        },
      },
    )

    expect(response).toMatchObject({
      statusCode: 201,
      body: { id: 'test' },
      headers: { Location: 'https://myurl.com' },
    })
  })
})
