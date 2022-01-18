const { ipcMain } = require('electron')
const { MongoClient } = require('mongodb')
const fs = require('fs').promises

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
    const result = await database.collection('item').findOne(
      { id: itemId }
    )
    return { message: 'done', result: result }
  })

  ipcMain.handle('get-binary-file', async (e, data) => {
    const { pathname } = data
    const file = await fs.readFile(pathname)
    return { message: 'done', result: file }
  })

  ipcMain.handle('save-manual-annotation-list', async (e, data) => {
    const { itemId, annotationList } = data
    const item = await database.collection('item').findOne(
      { id: itemId }
    )
    item.annotationList = annotationList
    await database.collection('item').
      updateOne({ _id: item._id }, { '$set': item })
    return { message: 'done', result: item }
  })

  ipcMain.handle('save-video-list', async (e, data) => {
    const { itemId, videoList } = data
    const item = await database.collection('item').findOne(
      { id: itemId }
    )
    item.videoList = videoList
    await database.collection('item').updateOne(
      { _id: item._id }, { '$set': item }
    )
    return { message: 'done', result: item }
  })
}
