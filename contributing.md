# Contributing

The key design principles of funcy are as follows:

- Sensible Defaults - Best practice and sensible options by default. Get going straight away without config.
- Progressive Disclosure - We keep interfaces simple and abstracted. Everything should be customisable, but hidden by default. See [progressive disclosure](https://en.wikipedia.org/wiki/Progressive_disclosure).
- All-In-One - Find everything you need by code-completion via the one interface.
- Performant - lazy loading, tree shaking, and profiling of pipelines.
- Extensible - Configurable, and options to extend the middy pipeline where needed.

## Getting Started

This repository enforces pnpm usage. You must [install pnpm](https://pnpm.io/installation) to use this repository.

Once installed, run the following locally:

```bash
# Install packages
pnpm install

# Run transpilation and tests
pnpm run typecheck
pnpm test
```

## Repository layout

funcy is architected as a monorepo using a pnpm workspace.

- /packages/core - core funcy concerns
- /packages/api - funcy usage for building APIs using AWS Api Gateway
- /examples - example projects showing the use of funcy
- /docs - github pages site

## Making a change

- Ensure you have forked the public repository and made your changes in a branch on your local fork.
- All changes must have corresponding test coverage in the same commit.
- All commits should be following the [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/#summary) standard.
- Run all tests and typecheck locally again before raising a PR.
- Raise the PR to the main repository, requesting review from a core contributor.
