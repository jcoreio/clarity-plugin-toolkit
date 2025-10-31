import { inspect } from 'util'
import sparkplug from '@jcoreio/sparkplug-client'
import { InputMetric } from '@jcoreio/sparkplug-payload/spBv1.0'
import requireEnv from '@jcoreio/require-env'

const TARGET_GROUP_ID = 'My Group'
const TARGET_NODE_ID = 'My Node'

const { URL, PUBLISH_INTERVAL } = process.env

const PORT = process.env.PORT || '21883'
const serverUrl = URL || `mqtt://localhost:${PORT}`
const username = requireEnv('USERNAME')
const password = process.env.PASSWORD || 'password'

const publishInterval = parseInt(PUBLISH_INTERVAL || '2000')

// Set to 1 to simulate a report by exception device that sends initial values
// and remains connected with values that never change
const noChanges = !!parseInt(process.env.NO_CHANGES || '0')

console.log({ serverUrl, username, password })

const client = sparkplug.newClient({
  serverUrl,
  clientId: `jcore-iron-pi-sim-id`,
  username,
  password,
  groupId: TARGET_GROUP_ID,
  edgeNode: TARGET_NODE_ID,
})

client.on('error', (err) => console.error('MQTT error:', err))

function getMetrics({
  includeProperties,
}: {
  includeProperties?: boolean
}): InputMetric[] {
  return [
    {
      name: 'Printer Status',
      type: 'String',
      value: 'active',
      properties:
        includeProperties ?
          { enumTypeName: toSparkPlugString('test') }
        : undefined,
    },
    {
      name: 'Cutter Status',
      type: 'String',
      value: 'active',
      properties:
        includeProperties ?
          { enumTypeName: toSparkPlugString('test') }
        : undefined,
    },
    {
      name: 'Queue Completed',
      type: 'Int32',
      value: 3,
    },
    {
      name: 'Queue Length',
      type: 'Int32',
      value: 10,
    },
    {
      name: 'Ink/C',
      type: 'Int32',
      value: 8,
      properties:
        includeProperties ?
          {
            engLow: toSparkPlugNumber(0),
            engHigh: toSparkPlugNumber(100),
          }
        : undefined,
    },
    {
      name: 'Ink/M',
      type: 'Int32',
      value: 22,
      properties:
        includeProperties ?
          {
            engLow: toSparkPlugNumber(0),
            engHigh: toSparkPlugNumber(100),
          }
        : undefined,
    },
    {
      name: 'Ink/Y',
      type: 'Int32',
      value: 24,
      properties:
        includeProperties ?
          {
            engLow: toSparkPlugNumber(0),
            engHigh: toSparkPlugNumber(100),
          }
        : undefined,
    },
    {
      name: 'Ink/K',
      type: 'Int32',
      value: 13,
      properties:
        includeProperties ?
          {
            engLow: toSparkPlugNumber(0),
            engHigh: toSparkPlugNumber(100),
          }
        : undefined,
    },
    {
      name: 'Ink/W',
      type: 'Int32',
      value: 15,
      properties:
        includeProperties ?
          {
            engLow: toSparkPlugNumber(0),
            engHigh: toSparkPlugNumber(100),
          }
        : undefined,
    },
  ]
}

function publishBirth() {
  const timestamp = Date.now()
  client.publishNodeBirth({
    timestamp,
    metrics: getMetrics({ includeProperties: true }),
  })
}

client.on('birth', () => {
  console.log('publishing birth')
  publishBirth()
})

const inspectPayload = (payload: unknown) =>
  inspect(payload, { depth: 8, colors: true })

client.on('ncmd', (payload) => {
  console.log('got NCMD:', inspectPayload(payload))
  for (const metric of payload.metrics || []) {
    if (metric.name === 'Node Control/Rebirth' && metric.value === true) {
      console.log('publishing rebirth')
      publishBirth()
    }
  }
})

client.on('dcmd', (deviceId, payload) => {
  console.log(`got DCMD for device ID ${deviceId}:`, inspectPayload(payload))
})

if (!noChanges) {
  setInterval(() => {
    const timestamp = Date.now()
    client.publishNodeData({
      timestamp,
      metrics: getMetrics({}),
    })

    // ++loopCount
    // if (++curIdx >= numTags) curIdx = 0
  }, publishInterval)
}

function toSparkPlugNumber(value: number | null) {
  return {
    type: 'Int32',
    value: Number.isFinite(value) ? value : null,
  } as const
}

function toSparkPlugString(value: string | null) {
  return {
    type: 'String',
    value:
      typeof value === 'string' ? value
      : Number.isFinite(value) ? String(value)
      : '',
  } as const
}
