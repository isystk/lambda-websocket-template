const DynamoDB = require('./dynamodb')

class User {
  dynamodb = null
  constructor() {
    this.dynamodb = new DynamoDB()
  }

  async get(connectionId) {
    try {
      const connection = await this.dynamodb.get({
        TableName: process.env.TABLE_NAME_CONNECTIONS,
        Key: {
          connectionId: connectionId,
        },
      })
      return connection
    } catch (e) {
      throw new Error(e)
    }
  }
  async list(roomId) {
    try {
      const room = await this.dynamodb.get({
        TableName: process.env.TABLE_NAME_ROOM,
        Key: {
          roomId: roomId,
        },
      })
      return room.Item ? room.Item.connectionIds : []
    } catch (e) {
      throw new Error(e)
    }
  }
  async add(roomId, user) {
    try {
      // connectionsテーブルに追加
      await this.dynamodb.put({
        TableName: process.env.TABLE_NAME_CONNECTIONS,
        Item: {
          connectionId: user.connectionId,
          roomId: roomId,
        },
      })
      // roomテーブルに追加
      const room = await this.dynamodb.get({
        TableName: process.env.TABLE_NAME_ROOM,
        Key: {
          roomId: roomId,
        },
      })
      let users = []
      if (!room.Item) {
        // ルームが未作成の場合、新規で作成する。
        console.log('room is not exist')
        users = [user]
      } else {
        // ルームが存在する場合、既存のルームに入室する。
        console.log('room is exist')
        room.Item.connectionIds.push(user)
        users = [...room.Item.connectionIds]
      }
      await this.dynamodb.put({
        TableName: process.env.TABLE_NAME_ROOM,
        Item: {
          roomId: roomId,
          connectionIds: users,
        },
      })
    } catch (e) {
      throw new Error(e)
    }
  }
  async remove(roomId, connectionId) {
    try {
      let users = await this.list(roomId)
      users = users.filter((user) => {
        return user.connectionId !== connectionId
      })
      // roomテーブルから削除
      await this.dynamodb.put({
        TableName: process.env.TABLE_NAME_ROOM,
        Item: {
          roomId: roomId,
          connectionIds: users,
        },
      })
      // connectionsテーブルから削除
      await this.dynamodb.delete({
        TableName: process.env.TABLE_NAME_CONNECTIONS,
        Key: {
          connectionId,
        },
      })
    } catch (e) {
      throw new Error(e)
    }
  }
}

module.exports = User
