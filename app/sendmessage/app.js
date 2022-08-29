const AWS = require('aws-sdk')
const User = require('user')

exports.handler = async (event, context) => {
  console.info('sendmessage start')
  console.log(`event: ${JSON.stringify(event)}`)
  console.log(`context: ${JSON.stringify(context)}`)
  const user = new User()

  const { connectionId } = event.requestContext
  //
  const connection = await user.get(connectionId)
  console.log(`connection: ${JSON.stringify(connection)}`)
  const { roomId } = connection.Item

  const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint:
      event.requestContext.domainName + '/' + event.requestContext.stage,
  })

  const { data, forward } = JSON.parse(event.body)
  const message = {
    sendId: connectionId,
    ...data,
  }
  console.log(`message: ${JSON.stringify(message)} forward: ${forward}`)

  if (data.type === 'who_am_i') {
    // 自分のconnectionIdを自分に送る
    await apigwManagementApi
      .postToConnection({
        ConnectionId: connectionId,
        Data: JSON.stringify({
          ...data,
          connectionId
        }),
      })
      .promise()
  } else {
    let users = await user.list(roomId)
    if (forward) {
      // targetが指定されている場合はそのユーザーのみに送信する
      users = users.filter((user) => {
        return user.connectionId === forward
      })
    }
    const postCalls = users.map(async ({ connectionId }) => {
      try {
        await apigwManagementApi
          .postToConnection({
            ConnectionId: connectionId,
            Data: JSON.stringify(message),
          })
          .promise()
      } catch (e) {
        if (e.statusCode === 410) {
          console.log(`Found stale connection, deleting ${connectionId}`)
          await user.remove(roomId, connectionId)
        } else {
          throw e
        }
        console.log(e)
      }
    })

    try {
      await Promise.all(postCalls)
    } catch (e) {
      return {
        statusCode: 500,
        body: e.stack,
      }
    }
  }

  console.info('sendmessage end')
  return {
    statusCode: 200,
    body: 'Data sent.',
  }
}
