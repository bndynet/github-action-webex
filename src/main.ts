import * as core from '@actions/core'
import axios from 'axios'

const actionAPIs = [
  {
    action: 'message',
    url: '/v1/messages',
    method: 'post'
  }
]

async function run(): Promise<void> {
  try {
    const server = core.getInput('server')
    const action = core.getInput('action')
    const roomId = core.getInput('room-id')
    const token = core.getInput('token')

    const matchedAction = actionAPIs.find(
      a => a.action.toLowerCase() === action?.toLowerCase()
    )

    if (!matchedAction) {
      core.warning(`Unknown action "${action}"`)
    }

    if (matchedAction) {
      const headers = {Authorization: `Bearer ${token}`}
      const requestData = {
        roomId,
        markdown: core.getInput('message')
      }
      const url = `${
        server.endsWith('/') ? server.slice(0, server.length - 1) : server
      }${matchedAction.url}`

      try {
        const requestConfig = {
          url,
          method: matchedAction.method,
          data: requestData,
          headers
        }
        core.debug(`Request Details: ${JSON.stringify(requestConfig)}`)

        const {data} = await axios(requestConfig)
        core.setOutput('event_id', data.id)
      } catch (error) {
        core.warning(
          `Err: ${matchedAction.method} to ${url} with body: ${JSON.stringify(
            requestData
          )}`
        )
      }
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
