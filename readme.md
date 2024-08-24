<p align="center">
  <img src="./docs/static/logo.png" width="220px" align="center" alt="funcy logo" />
  <p align="center">
    Strongly typed, best practice & simple declarative interface for AWS lambda functions
    <br />
  </p>
</p>

<p align="center">
  <a href="https://github.com/refactorthis/funcy/actions/workflows/main.yml?query=branch%3Amain"><img src="https://github.com/refactorthis/funcy/actions/workflows/main.yml/badge.svg?event=push&branch=main" alt="CI status" /></a>
  <a href="https://opensource.org/licenses/MIT" rel="nofollow"><img src="https://img.shields.io/github/license/refactorthis/funcy" alt="License"></a>
</p>

<div align="center">
  <a href="https://github.com/refactorthis/funcy/blob/main/readme.md">docs</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://www.npmjs.com/package/@refactorthis/funcy">npm</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://github.com/refactorthis/funcy/issues/new">issues</a>
</div>

<br />

> **NOTE** funcy is in pre-release. We will attempt to keep the API as-is, however there may be breaking changes during this period.

## funcy

- [funcy](#funcy)
- [Introduction](#introduction)
  - [Preview](#preview)
- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Writing funcy Functions](#writing-funcy-functions)
  - [Examples](#examples)
- [Schema Parsing Support](#schema-parsing-support)
- [Performance Comparisons](#performance-comparisons)
- [Roadmap](#roadmap)
- [See Also](#see-also)
  - [Complementary Packages](#complementary-packages)
  - [Acknowledgements](#acknowledgements)

## Introduction

**funcy** provides a TypeScript-first (fully typed), best practice & simple functional interface for AWS lambda functions. The perfect complement to serverless frameworks such as the [serverless](https://www.serverless.com/framework), [SST](https://sst.dev), [SAM](https://aws.amazon.com/serverless/sam/), etc.

Features:

- Strongly typed request and response models (inferred or explicit)
- Best practices pipeline with sensible defaults for CORS, security headers, encoding, error handling, metrics, logging, and profiling out of the box.
- A fully-configurable and batteries-included interface; everything you need is an ctrl+space away.

If you prefer lightweight lambda functions and don't want a full-blown framework (like NestJS), then this is for you.

### Preview

The example below shows parsing, validating and inferring a strongly-typed model for both request and response.

```typescript
import { api, res } from '@refactorthis/funcy'
import { CreateCustomerRequest, CreateCustomerResponse } from './dtos'

// create customer handler
export const create = api({
  parser: {
    request: CreateCustomerRequest, // zod or yup schema
    response: CreateCustomerResponse, // zod or yup schema
  },
  handler: async ({ request }) = {
    const response = await Customer.create(request)
    return res.ok(response)
  }
})
```

You'll notice that the handler itself does not contain any parsing, validation or error handling logic, we adhere to the single-responsibility-principle here and handle all other aspects in middleware, configurable at either api or handler level.

![example image](docs/static/example-strongly-typed.png)

As you can see above, the TypeScript type is inferred at compile time, allowing strong typing of all request and response parameters to your API, almost by magic.

funcy also has a full middleware pipeline, allowing you to control things like CORS, content negotiation, encoding, security header best practices, etc. all out of the box. All you need to do is ctrl+space to see the options. Options can either be set as default for the whole api, or overridden for each handler

![example image](docs/static/example-autocomplete.png)

## Getting Started

### Installation

```sh
pnpm add @refactorthis/funcy
#bun add @refactorthis/funcy
#yarn add @refactorthis/funcy
#npm install --save @refactorthis/funcy
```

If you haven't already installed your validation framework, add one to your package.

```sh
pnpm add zod
# or
# pnpm add yup
```

### Writing funcy Functions

To get started let's create a simple API Gateway Proxy (HTTP or REST) lambda handler. This will validate the request and the response with our predefined zod schemas.

```typescript
import { api, res } from '@refactorthis/funcy'
import { MyRequest, MyResponse } from './dtos'

export const handler = api({
  parser: {
    request: MyRequest, // zod or yup schema
    response: MyResponse, // zod or yup schema
  },
  handler: async({ request }) = {
    // request is the strongly typed request body
    // response is also validated and strongly typed
    return res.ok(response)
  }
})
```

You can create your own api handlers using api-level defaults. For instance, let's use a custom authorizer context, with strongly typed claims, for use across all of our api.

```typescript
// my-api.ts
import { createApi } from '@refactorthis/funcy'

// my authorizer struct
interface AuthorizerType {
  jwt: { claims: { tenantId: 'string' } }
}

// Create this once for your API and share it
// We will set the authorizer to use, and allow a cross-origin domain
export const api = createApi<AuthorizerType>({
  http: { cors: { origin: 'web.mydomain.com' } },
})
```

```typescript
// customers-create.ts
import { res } from '@refactorthis/funcy'
import { api } from './my-api'

export const handler = api({
  parser: {
    request: MyRequestSchema,
    response: MyResponseSchema,
    path: PathSchema,
    query: QueryStringSchema,
  },
  handler: async({ request, path, query, authorizer }) = {
    // request is the strongly typed request body
    // path is the strongly typed url path
    // query is the strongly typed query string
    // authorizer is the strongly typed authorizer context as specified in my-api.ts
    // responseType is the strongly typed response type
    return res.ok(responseType)
  }
})
```

All handlers using this api will return the appropriate CORS headers, as specified.

### Examples

Let's create CRUD handlers for the "Customer" domain, with request validation.

```typescript
import { api, res } from '@refactorthis/funcy'

// create
export const handler = api({
  parser: {
    request: CreateCustomerRequest,
    response: CreateCustomerResponse,
  },
  handler: async ({ request }) = {
    const response = await Customers.create(request)
    return res.created(response)
  }
})

// get
export const handler = api({
  parser: {
    path: GetResourcePath,
    response: GetCustomerResponse,
  },
  handler: async ({ request, path }) = {
    const response = await Customers.get(path.id)
    return res.ok(response)
  }
})

// list
export const handler = api({
  parser: {
    query: ListQueryStringValidator,
  },
  handler: async ({ request, query }) = {
    const { skip, take } = query
    const items = await Customers.list(skip, take)
    return res.ok({ items, skip, take })
  }
})

// update
export const handler = api({
  parser: {
    request: UpdateCustomerRequest,
    response: UpdateCustomerResponse,
    path: GetResourcePath,
  },
  handler: async ({ request, path }) = {
    const response = await Customers.update(path.id, request)
    return res.ok(response)
  }
})
```

## Schema Parsing Support

funcy is built to be agnostic of schema library. At this time funcy supports:

- [zod](https://github.com/colinhacks/zod)
- [yup](https://github.com/jquense/yup)

## Performance Comparisons

funcy
Nest.js
Express
Koa

## Roadmap

- Support for other schema libraries
- Verify support for legacy API Gateway proxy integration (< v2)
- Performance test comparison with nest.js, raw lambda, etc.
- Other lambda integrations (s3, dynamo, etc)
- hateoas middleware
- router middleware for proxy+ calls

## See Also

### Complementary Packages

Working with zod:

- [zod](https://github.com/colinhacks/zod) - a great Typescript-first validation framework, which can infer your DTO types automatically
- [zod-to-openapi](https://github.com/asteasolutions/zod-to-openapi) - generate your Open API definition code-first from zod schemas.
- [openapi-zod-client](https://github.com/astahmer/openapi-zod-client) - alternatively, generate your code from your design-first Open API definition

Working with yup:

- [yup](https://github.com/jquense/yup) - Dead simple Object schema validation
- [openapi-yup-generator](https://github.com/igtm/openapi-yup-generator) - Generate your yup schemas from Open API definition

### Acknowledgements

- [middy.js](https://github.com/middyjs/middy) - powers the funcy pipeline with it's extensible middleware framework.
- [TypeScript](https://github.com/microsoft/TypeScript) - strong-typing is critical for maintainability and reducing bugs.
