import { describe, it } from 'mocha'
import { expect } from 'chai'
import dedent from 'dedent-js'
import { migrateDotenv } from '../src/util/migrateDotenv.ts'

describe(`migrateDotenv`, function () {
  it(`adds AWS_SDK_LOAD_CONFIG=1`, function () {
    const init = dedent`
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
      MQTT_PORT=21883
      MQTTS_PORT=
      PORT=20081
      DEV_PORT=20080
      PROFILER_BASE_URL='/profiler'
      PROFILER_PORT=6676
      ROOT_URL="http://\${HOST}:\${DEV_PORT}"
      RECAPTCHA_BYPASS_TOKEN=bypass
      STORE_DOWNLOADS_LOCALLY=1
      ADMIN_EMAIL=dev@jcore.io
      ADMIN_PASSWORD=password
      TASKS=migrate,app,mqtt,cleanup,sync-channel-settings,ingest-sweeper,downsample-sweeper,notification-sender,tag-computer,activity-historian,device-offline-notifier,trigger-handler,historical-data-report-sender,migrate-ciphertexts

      # Please fill out the following fields:
      CLARITY_REPO= # e.g. XXXXXXXXXXXX.dkr.ecr.us-west-2.amazonaws.com/jcore/clarity-dev
    `

    const migrated = migrateDotenv(init)
    expect(migrated, 'migrateDotenv(init)').to.equal(dedent`
      # migrated version: 2
      AWS_SDK_LOAD_CONFIG=1
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
      MQTT_PORT=21883
      MQTTS_PORT=
      PORT=20081
      DEV_PORT=20080
      PROFILER_BASE_URL='/profiler'
      PROFILER_PORT=6676
      ROOT_URL="http://\${HOST}:\${DEV_PORT}"
      RECAPTCHA_BYPASS_TOKEN=bypass
      STORE_DOWNLOADS_LOCALLY=1
      ADMIN_EMAIL=dev@jcore.io
      ADMIN_PASSWORD=password
      TASKS=migrate,app,mqtt,cleanup,sync-channel-settings,ingest-sweeper,downsample-sweeper,notification-sender,tag-computer,activity-historian,device-offline-notifier,trigger-handler,historical-data-report-sender,migrate-ciphertexts

      # Please fill out the following fields:
      CLARITY_REPO= # e.g. XXXXXXXXXXXX.dkr.ecr.us-west-2.amazonaws.com/jcore/clarity-dev
    `)

    expect(migrateDotenv(migrated), 'migrateDotenv(migrated)').to.equal(
      migrated
    )
  })
})
