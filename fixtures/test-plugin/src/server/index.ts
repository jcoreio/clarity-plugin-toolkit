import {
  ServerPluginContributions,
  getAPIContext,
} from '@jcoreio/clarity-plugin-api/server'
import express from 'express'
import bodyParser from 'body-parser'
import path from 'path'

export default (() => {
  const api = express.Router()
  api.get('/hello', (req, res) =>
    res.status(200).set('Content-Type', 'text/plain').end('hello world!')
  )
  api.get('/actorId', (req, res) =>
    res
      .status(200)
      .set('Content-Type', 'text/plain')
      .end(String(getAPIContext(req).actorId))
  )
  api.use('/foos', bodyParser.json({ limit: '1mb', strict: false }))

  api.put('/foos/:key', async (req, res, next) => {
    try {
      const {
        appContext: { postgresPool },
      } = getAPIContext(req)
      await postgresPool.query(
        `INSERT INTO "@jcoreio/clarity-test-plugin".foo (key, value) VALUES ($1, $2::jsonb)
          ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;`,
        [req.params.key, req.body]
      )
      res.status(200).end()
    } catch (error) {
      next(error)
    }
  })

  api.get('/foos/:key', async (req, res, next) => {
    try {
      const {
        appContext: { postgresPool },
      } = getAPIContext(req)
      const {
        rows: [row],
      } = await postgresPool.query(
        `SELECT * FROM "@jcoreio/clarity-test-plugin".foo WHERE key = $1`,
        [req.params.key]
      )
      if (!row) {
        return res.status(404).end()
      }
      res.status(200).json(row.value)
    } catch (error) {
      next(error)
    }
  })

  return {
    api,
    migrations: { path: path.join(__dirname, 'migrations') },
  }
}) satisfies ServerPluginContributions
