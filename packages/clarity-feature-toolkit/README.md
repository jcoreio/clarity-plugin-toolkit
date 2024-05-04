# `@jcoreio/clarity-feature-toolkit`

This is a CLI that makes it easy to build and deploy your custom feature to [Clarity](https://www.jcore.io/clarity).
It provides a managed webpack config and scripts to orchestrate the process of uploading the webpack bundles to Clarity.

## Getting Started

The easiest way to get started is to create a project with [`create-clarity-feature`](https://github.com/jcoreio/clarity-feature-toolkit/tree/master/packages/create-clarity-feature):

```sh
npx create-clarity-feature@latest
# or
yarn create clarity-feature
# or
pnpm create clarity-feature
# or
bunx create-clarity-feature
```

## Deploying

Run `npm exec clarity-feature-toolkit deploy` to begin the interactive feature deployment process.
First the CLI will ask you for the URL of your Clarity deployment.
Then, it will have you create a code signing key in Clarity.
Finally, it will rebuild the webpack bundles if necessary and upload them to Clarity via its REST
API.
