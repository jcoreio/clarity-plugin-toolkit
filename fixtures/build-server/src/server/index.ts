import { ServerPluginContributions } from '@jcoreio/clarity-plugin-api/server'
import express from 'express'
import { message } from './constants.js'

export default (() => {
  const api = express.Router()
  api.get('/hello', (req, res) =>
    res.status(200).set('Content-Type', 'text/plain').end(message)
  )

  return {
    api,
  }
}) satisfies ServerPluginContributions
