# `create-clarity-plugin`

This CLI helps you get started on developing a plugin for [Clarity](https://www.jcore.io/clarity).
Use the following command:

```sh
npx create-clarity-plugin@latest
# or
yarn create clarity-plugin
# or
pnpm create clarity-plugin
# or
bunx create-clarity-plugin
```

`create-clarity-plugin` will ask you for the name of your project, whether you want to use TypeScript,
what kind of example plugin contributions you want it to create, and various other options.

Once the project is created, it will install `react`, `@jcoreio/clarity-plugin-api`,
[`@jcoreio/clarity-plugin-toolkit`](https://github.com/jcoreio/clarity-plugin-toolkit/tree/master/packages/clarity-plugin-toolkit),
and other dependencies you need to get started.

After that, running the `dev` package script in the project should be all you need to get started
running your plugin in a local instance of Clarity in watch mode!

(You will need for us to create a policy in AWS granting you access to our private Elastic Container Repository
containing the Docker images for Clarity to test out your plugin.)
