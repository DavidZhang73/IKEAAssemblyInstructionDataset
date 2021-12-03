const { ipcMain } = require('electron')
const { MongoClient } = require('mongodb')

let database

module.exports = () => {
  ipcMain.handle('connect-mongodb', async (e, data) => {
    const { mongoURL, mongoDatabaseName } = data
    const client = new MongoClient(mongoURL)
    await client.connect()
    database = client.db(mongoDatabaseName)
    const result = await database.collection('category').find().toArray()
    return { message: 'done', result: result }
  })

  ipcMain.handle('get-item-list', async (e, data) => {
    const { subCategoryName } = data
    const result = await database.collection('item').
      find({ subCategory: subCategoryName }).
      toArray()
    return { message: 'done', result: result }
  })

  ipcMain.handle('get-item', async (e, data) => {
    const { itemId } = data
    const result = await database.collection('item').find(
      { id: itemId }
    ).toArray()
    return { message: 'done', result: result }
  })
}