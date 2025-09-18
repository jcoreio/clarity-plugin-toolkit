# `@jcoreio/clarity-plugin-toolkit`

This is a CLI that makes it easy to build and deploy your plugin to [Clarity](https://www.jcore.io/clarity).
It provides a managed webpack config and scripts to orchestrate the process of uploading the webpack bundles to Clarity.

## Getting Started

The easiest way to get started is to create a project with [`create-clarity-plugin`](https://github.com/jcoreio/clarity-plugin-toolkit/tree/master/packages/create-clarity-plugin):

```sh
npx create-clarity-plugin@latest
# or
yarn create clarity-plugin
# or
pnpm create clarity-plugin
# or
bunx create-clarity-plugin
```

## Deploying

Run `npm exec clarity-plugin-toolkit deploy` to begin the interactive plugin deployment process.
First the CLI will ask you for the URL of your Clarity deployment.
Then, it will have you create a code signing key in Clarity.
Finally, it will rebuild the webpack bundles if necessary and upload them to Clarity via its REST
API.
