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

funcy is architected as a single package.

- /src/core - core funcy concerns
- /src/integrations - various integrations for building services using funcy
- /test - test helpers and mocks
- /examples - example projects showing the use of funcy
- /docs - github pages site

## Making a change

- Ensure you have forked the public repository and made your changes in a branch on your local fork.
- All changes must have corresponding test coverage in the same commit.
- Run all tests and typecheck locally again before raising a PR.
- Raise the PR to the main repository, requesting review from a core contributor.

## Documentation

If your changes involve new features or modifications to existing functionality, please update the relevant documentation. This includes:

- Inline code comments
- README.md files
- API documentation (if applicable)
- Update examples in the `/examples` directory if necessary

## Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. Please ensure your commit messages are structured as follows:

```
<type>[optional scope]: <description>

<body>

[optional footer(s)]
```

## Code Style and Linting

We use ESLint and Prettier to maintain consistent code style. Before submitting a pull request, please ensure your code passes the linting and formatting checks.
