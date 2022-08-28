const AWS = require('aws-sdk')
const User = require('user')

exports.handler = async (event, context) => {
  console.info('ondisconnect start')
  console.log(`event: ${JSON.stringify(event)}`)
  console.log(`context: ${JSON.stringify(context)}`)
  const user = new User()

  const { connectionId } = event.requestContext

  const connection = await user.get(connectionId)
  console.log(`connection: ${JSON.stringify(connection)}`)
  const { roomId } = connection.Item

  // 自分以外のメンバーを取得する。
  const users = await user.list(roomId)
  const roomMembers = users.filter((user) => {
    return user.connectionId !== connectionId
  })

  // ユーザーを削除する
  await user.remove(roomId, connectionId)

  // Push Message
  const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint:
      event.requestContext.domainName + '/' + event.requestContext.stage,
  })

  for (const member of roomMembers) {
    console.log(`connectionId: ${JSON.stringify(member.connectionId)}`)
    try {
      const message = {
        type: 'unjoin',
        connectionId,
        room: {
          users: roomMembers,
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

  console.info('ondisconnect end')
}
