import { getProjectBase } from '../getProject'
import fs from 'fs-extra'
import { isInteractive } from './isInteractive'
import prompt from 'prompts'
import dedent from 'dedent-js'
import randomstring from 'randomstring'
import crypto from 'crypto'
import { promisify } from 'util'
import path from 'path'
import Gitignore from 'gitignore-fs'

export async function setupDockerCompose({
  cwd = process.cwd(),
}: { cwd?: string } = {}) {
  const { projectDir, dockerComposeFile, dotenvFile } =
    await getProjectBase(cwd)
  if (await fs.pathExists(dockerComposeFile)) return

  if (!isInteractive) {
    throw new Error('must be run in an interactive terminal')
  }

  const { repo, dbPort, redisPort, httpPort, devPort, mqttPort } = await prompt(
    [
      {
        name: 'repo',
        type: 'text',
        message: 'Enter Clarity docker repository:',
      },
      {
        name: 'devPort',
        type: 'number',
        min: 1000,
        max: 65535,
        message: 'Desired dev server port:',
        initial: 20080,
      },
      {
        name: 'httpPort',
        type: 'number',
        min: 1000,
        max: 65535,
        message: 'Desired HTTP port:',
        initial: 20081,
      },
      {
        name: 'mqttPort',
        type: 'number',
        min: 1000,
        max: 65535,
        message: 'Desired MQTT port:',
        initial: 21883,
      },
      {
        name: 'dbPort',
        type: 'number',
        min: 1000,
        max: 65535,
        message: 'Desired Postgres port:',
        initial: 25432,
      },
      {
        name: 'redisPort',
        type: 'number',
        min: 1000,
        max: 65535,
        message: 'Desired Redis port:',
        initial: 26379,
      },
    ]
  )
  if (!repo) {
    throw new Error('no docker repository given')
  }

  const key = await promisify(crypto.generateKey)('aes', { length: 256 })

  if (!(await new Gitignore().ignores(dotenvFile))) {
    await fs.appendFile(
      path.join(projectDir, '.gitignore'),
      `/${path.relative(projectDir, dotenvFile)}`
    )
  }

  await fs.writeFile(
    dockerComposeFile,
    dedent`
      services:
        db:
          image: timescale/timescaledb:2.15.1-pg16
          ports:
            - \${DB_PORT}:5432
          environment:
            - POSTGRES_PASSWORD=\${DB_PASSWORD}
          command: postgres -c max_connections=200 -c log_min_duration_statement=1000
        redis:
          image: redis:3.2
          ports:
            - \${REDIS_PORT}:6379
        app:
          image: \${CLARITY_REPO}:45.0.7
          volumes:
            - ./.clarity-plugin-toolkit/dev:/usr/app/build/bundled-plugins
            - ./node_modules:/usr/app/build/bundled-plugins/external_node_modules
          ports:
            - '\${PORT}:80'
            - '\${MQTT_PORT}:\${MQTT_PORT}'
          environment:
            - ADMIN_EMAIL
            - ADMIN_PASSWORD
            - AWS_DEFAULT_REGION
            - AWS_REGION
            - BYPASS_RECAPTCHA_TOKEN
            - CANARY_PASSWORD
            - COPYRIGHT
            - DB_HOST=db
            - DB_MIGRATE
            - DB_NAME
            - DB_PASSWORD
            - DB_PORT=5432
            - DB_USER
            - ENABLE_DEV_LOGIN
            - FILE_ATTACHMENT_S3_BUCKET
            - HISTORIAN_DB_HOST=db
            - HISTORIAN_DB_NAME
            - HISTORIAN_DB_PASSWORD
            - HISTORIAN_DB_PORT=5432
            - HISTORIAN_DB_USER
            - HISTORIAN_DB_PASSWORD
            - HISTORIAN_REDIS_HOST=redis
            - HISTORIAN_REDIS_PORT=6379
            - HOST
            - HTTPS_PORT
            - JCOREIO_LINK
            - JWT_SECRET
            - LETSENCRYPT_EMAIL
            - LIVECHAT_LICENSE
            - LOGIN_MIN_RECAPTCHA_SCORE
            - MQTT_PORT
            - MQTTS_PORT
            - NOTIFICATIONS_API_TOKEN
            - NOTIFICATIONS_API_URL
            - PROFILER_BASE_URL
            - PROFILER_PORT
            - RECAPTCHA_SITE_KEY
            - RECAPTCHA_SECRET_KEY
            - RECAPTCHA_V2_SITE_KEY
            - RECAPTCHA_V2_SECRET_KEY
            - RECAPTCHA_BYPASS_TOKEN
            - REDIS_DB
            - REDIS_HOST=redis
            - REDIS_PORT=6379
            - ROOT_URL
            - SIGNUP_MIN_RECAPTCHA_SCORE
            - SIGNUPS_ENABLED
            - STORE_DOWNLOADS_LOCALLY
            - STRIPE_PUBLISHABLE_KEY
            - STRIPE_SECRET_KEY
            - SECRETS
            - TASK
            - TASKS
    `
  )

  await fs.appendFile(
    dotenvFile,
    dedent`
      CLARITY_REPO=${repo}
      REDIS_DB=0
      REDIS_PORT=${redisPort}
      AWS_REGION=us-west-2
      CANARY_PASSWORD=password
      DB_NAME=clarity
      DB_USER=postgres
      DB_PASSWORD=password
      DB_PORT=${dbPort}
      HISTORIAN_DB_NAME=historian
      HISTORIAN_DB_USER=postgres
      HISTORIAN_DB_PASSWORD="\${DB_PASSWORD}"
      HISTORIAN_DB_PORT="\${DB_PORT}"
      HISTORIAN_REDIS_DB=1
      HISTORIAN_REDIS_PORT="\${REDIS_PORT}"
      HOST=localhost
      HTTPS_PORT=
      JWT_SECRET=${JSON.stringify(randomstring.generate({ length: 32 }))}
      LOGIN_MIN_RECAPTCHA_SCORE=0.15
      SIGNUP_MIN_RECAPTCHA_SCORE=0.15
      MQTT_PORT=${mqttPort}
      MQTTS_PORT=
      NOTIFICATIONS_DISABLED=1
      PORT=${httpPort}
      DEV_PORT=${devPort}
      PROFILER_BASE_URL='/profiler'
      PROFILER_PORT=6676
      ROOT_URL="http://\${HOST}:\${DEV_PORT}"
      RECAPTCHA_BYPASS_TOKEN=bypass
      SECRETS='${JSON.stringify({
        EncryptionKeys: [
          {
            id: 1,
            key: key.export().toString('base64'),
            state: 'ACTIVE',
            createdAt: new Date().toISOString(),
          },
        ],
      })}'
      STORE_DOWNLOADS_LOCALLY=1
      ADMIN_EMAIL=dev@jcore.io
      ADMIN_PASSWORD=password
      TASKS=migrate,app,mqtt,cleanup,sync-channel-settings,ingest-sweeper,downsample-sweeper,notification-sender,tag-computer,activity-historian,device-offline-notifier,trigger-handler,historical-data-report-sender,migrate-ciphertexts

      # Please fill out the following fields:
      STRIPE_PUBLISHABLE_KEY=
      STRIPE_SECRET_KEY=
      RECAPTCHA_SITE_KEY=
      RECAPTCHA_SECRET_KEY=
      RECAPTCHA_V2_SITE_KEY=
      RECAPTCHA_V2_SECRET_KEY=
    `,
    'utf8'
  )

  // eslint-disable-next-line no-console
  console.error(
    `Wrote ${path.relative(cwd, dockerComposeFile)} and ${path.relative(cwd, dotenvFile)}.  Please fill out the secrets in ${path.relative(cwd, dotenvFile)} and restart.`
  )
  process.exit(1)
}
