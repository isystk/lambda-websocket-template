const AWS = require('aws-sdk')
const docClient = new AWS.DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  region: process.env.AWS_REGION,
})

class DynamoDB {
  constructor() {}

  async get(params) {
    try {
      return await docClient.get(params).promise()
    } catch (e) {
      throw new Error(e)
    }
  }
  async put(params) {
    try {
      await docClient.put(params).promise()
    } catch (e) {
      throw new Error(e)
    }
  }
  async delete(params) {
    try {
      await docClient.delete(params).promise()
    } catch (e) {
      throw new Error(e)
    }
  }
}

module.exports = DynamoDB
