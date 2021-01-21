const fs = require('fs')
const cbr = require('content-based-recommender')

// Load app data from file
const db = JSON.parse(fs.readFileSync('data/appsData.json', 'utf8'))

// Preparing data and recommender
const data = db.map(el => {
    return {
        id: el['id'],
        content: el['description']
    }
})
const recommender = new cbr({
  minScore: 0.1,
  maxSimilarDocuments: 25,
  debug: true
})

// Training and saving the model
recommender.train(data)
const model = recommender.export()
try {
    fs.writeFileSync('data/modelData.json', JSON.stringify(model))
} catch (err) {
    console.error(err)
}
console.log('Model saved')