import dedent from 'dedent-js'
import { TemplateOptions } from './TemplateOptions'

export function readme({ packageManager }: TemplateOptions) {
  return {
    'README.md': dedent`
      This is a [Clarity](https://www.jcore.io/clarity) plugin project bootstrapped with [\`create-clarity-plugin\`](https://github.com/jcoreio/clarity-plugin-toolkit/tree/master/packages/create-clarity-plugin).

      # Getting started

      Make sure we have added policies to grant you access to our private AWS Elastic Container Repository where the Docker
      images for Clarity are stored.

      Run \`${packageManager} ${packageManager === 'npm' ? 'run dev' : 'dev'}\` to start the plugin dev server.
      On the first run it will create \`.env\` and \`docker-compose.yml\` files and ask you to fill out some fields in \`.env\`
      (currently, you only need to set the hostname of our private AWS Elastic Container Repository).

      Thereafter running \`${packageManager} ${packageManager === 'npm' ? 'run dev' : 'dev'}\` will automatically start up
      build watch processes and the Clarity docker container with your plugin from this project mounted into it.  It will
      automatically open Clarity in your browser once it's up and running!

      # Dev mode

      The dev server supports Webpack [Hot Module Replacement](https://webpack.js.org/concepts/hot-module-replacement/) and
      whenever you change client modules the changes should theoretically show up in the browser.  However \`react-refresh\`
      hasn't seemed reliable, at least not with the version of \`react\` Clarity is on.  But changes should at least show up
      after you refresh the page.

      If you change backend modules, the dev server will restart the docker container as soon as possible with the new code.

      # Deploying

      Run \`${packageManager} run deploy\`, and \`clarity-plugin-toolkit\` will run through the process of deploying to
      Clarity in an interactive CLI.
    `,
  }
}
