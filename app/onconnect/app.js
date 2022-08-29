const AWS = require('aws-sdk')
const User = require('user')

exports.handler = async (event, context) => {
  console.info('onconnect start')
  console.log(`event: ${JSON.stringify(event)}`)
  console.log(`context: ${JSON.stringify(context)}`)
  const user = new User()

  const { connectionId } = event.requestContext
  const { roomId = 'test' } = event.queryStringParameters
  console.log(`roomId: ${roomId}`)

  // ユーザーを追加する
  try {
    await user.add(roomId, {
      connectionId: connectionId,
    })
  } catch (err) {
    return {
      statusCode: 500,
      body: 'Failed to connect: ' + JSON.stringify(err),
    }
  }

  // Push Message
  const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint:
      event.requestContext.domainName + '/' + event.requestContext.stage,
  })

  // 自分以外のメンバーを取得する。
  const users = await user.list(roomId)
  const roomMembers = users.filter((user) => {
    return user.connectionId !== connectionId
  })
  for (const member of roomMembers) {
    console.log(`connectionId: ${JSON.stringify(member.connectionId)}`)
    try {
      const message = {
        type: 'join',
        connectionId,
        room: {
          users: users,
        },
      }
      await apigwManagementApi
        .postToConnection({
          ConnectionId: member.connectionId,
          Data: JSON.stringify(message),
        })
        .promise()
    } catch (e) {
      if (e.statusCode === 410) {
        console.log(`Found stale connection, deleting ${member.connectionId}`)
        await user.remove(roomId, member.connectionId)
      } else {
        console.error(`e: ${JSON.stringify(e)}`)
        throw e
      }
    }
  }

  console.info('onconnect end')
  return {
    statusCode: 200,
    body: JSON.stringify({
      connectionId,
    }),
  }
}
