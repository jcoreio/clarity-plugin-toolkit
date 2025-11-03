import { getProjectBase } from '../getProject'
import fs from 'fs-extra'
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
        s3:
          image: adobe/s3mock:4.9.1
          environment:
            - initialBuckets=\${FILE_ATTACHMENT_S3_BUCKET}
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
            # right now these are only used for connecting to the S3 mock, so
            # they don't need to be real credentials
            - AWS_ACCESS_KEY_ID=XXXXXXXXXXXXXXXXXXXX
            - AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
            - BYPASS_RECAPTCHA_TOKEN
            - CANARY_PASSWORD
            - COPYRIGHT
            - DB_HOST=db
            - DB_MIGRATE
            - DB_NAME
            - DB_PASSWORD
            - DB_PORT=5432
            - DB_USER
            - DISABLE_RECAPTCHA=1
            - DISABLE_STRIPE=1
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
            - MQTT_PORT
            - MQTTS_PORT
            - NOTIFICATIONS_DISABLED=1
            - PROFILER_BASE_URL
            - PROFILER_PORT
            - REDIS_DB
            - REDIS_HOST=redis
            - REDIS_PORT=6379
            - ROOT_URL
            - S3_ENDPOINT=http://s3:9090
            - SIGNUPS_ENABLED
            - STORE_DOWNLOADS_LOCALLY
            - SECRETS
            - TASK
            - TASKS
    `
  )

  await fs.appendFile(
    dotenvFile,
    '\n' +
      dedent`
      REDIS_DB=0
      REDIS_PORT=26379
      AWS_REGION=us-west-2
      CANARY_PASSWORD=password
      DB_NAME=clarity
      DB_USER=postgres
      DB_PASSWORD=password
      DB_PORT=25432
      FILE_ATTACHMENT_S3_BUCKET=upload-dev.clarity.jcore.io
      HISTORIAN_DB_NAME=historian
      HISTORIAN_DB_USER=postgres
      HISTORIAN_DB_PASSWORD="\${DB_PASSWORD}"
      HISTORIAN_DB_PORT="\${DB_PORT}"
      HISTORIAN_REDIS_DB=1
      HISTORIAN_REDIS_PORT="\${REDIS_PORT}"
      HOST=localhost
      HTTPS_PORT=
      JWT_SECRET=${JSON.stringify(randomstring.generate({ length: 32 }))}
      MQTT_PORT=21883
      MQTTS_PORT=
      PORT=20081
      DEV_PORT=20080
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
      CLARITY_REPO= # e.g. XXXXXXXXXXXX.dkr.ecr.us-west-2.amazonaws.com/jcore/clarity-dev
    `,
    'utf8'
  )

  // eslint-disable-next-line no-console
  console.error(
    dedent`
      Wrote ${path.relative(cwd, dockerComposeFile)} and ${path.relative(cwd, dotenvFile)}.
      Please fill out the secrets at the bottom of ${path.relative(cwd, dotenvFile)} and restart.
    `
  )
  process.exit(1)
}
