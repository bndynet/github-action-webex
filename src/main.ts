import * as core from '@actions/core'
import axios from 'axios'

interface Action {
  action: string
  url: string
  method: string
}

const actionAPIs = [
  {
    action: 'message',
    url: '/v1/messages',
    method: 'post'
  }
]

async function doActionToRoom(
  token: string,
  server: string,
  action: Action,
  requestData: unknown
): Promise<void> {
  const headers = {Authorization: `Bearer ${token}`}

  const url = `${
    server.endsWith('/') ? server.slice(0, server.length - 1) : server
  }${action.url}`

  try {
    const requestConfig = {
      url,
      method: action.method,
      data: requestData,
      headers
    }
    core.debug(`Request Details: ${JSON.stringify(requestConfig)}`)

    const {data} = await axios(requestConfig)
    core.setOutput('event_id', data.id)
  } catch (error) {
    core.warning(
      `Err: ${action.method} to ${action.url} with body: ${JSON.stringify(
        requestData
      )}`
    )
  }
}

async function run(): Promise<void> {
  try {
    const server = core.getInput('server')
    const action = core.getInput('action')
    const rooms = (core.getInput('rooms') || '')
      .split(';')
      .join(',')
      .split(',')
      .filter(item => !!item)
      .map(item => item.trim())
    const token = core.getInput('token')

    const matchedAction = actionAPIs.find(
      a => a.action.toLowerCase() === action?.toLowerCase()
    )

    if (!matchedAction) {
      core.warning(`Unknown action "${action}"`)
    }

    if (matchedAction) {
      await Promise.all(
        rooms.map(async roomId => {
          const requestData = {
            roomId,
            markdown: core.getInput('message')
          }
          return await doActionToRoom(token, server, matchedAction, requestData)
        })
      )
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
