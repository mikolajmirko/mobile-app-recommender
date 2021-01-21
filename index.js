const express = require('express')
const fs = require('fs')
const cbr = require('content-based-recommender')

// Load app data from file
const db = JSON.parse(fs.readFileSync('data/appsData.json', 'utf8'))

// Load recommender system
const model = JSON.parse(fs.readFileSync('data/modelData.json', 'utf8'))
const recommender = new cbr()
recommender.import(model)

// Setting up http server
const app = express()
const port = 3000
app.set('view engine', 'pug')

app.get('/', function (req, res) {
   // App catalouge with search and pagination
   let apps = db;
   const appsPerPage = 15
   let pageCount = Math.ceil(apps.length / appsPerPage)
   let page = parseInt(req.query.p)
   let searchTerm = req.query.search
   if (!page) { page = 1 }
   if (page > pageCount) {
     page = pageCount
   }
   if(searchTerm) {
      apps = apps.filter(app => app.name.toLowerCase().includes(searchTerm.toLowerCase()))
      pageCount = Math.ceil(apps.length / appsPerPage)
   }
   apps = apps.slice(page * appsPerPage - appsPerPage, page * appsPerPage)
   res.render('index', { page: page, pageCount: pageCount, search: searchTerm ? searchTerm : null, apps: apps })
})

app.get('/app/:id', function (req, res) {
   // App details and recommendations
   const appData = db.find(el => el.id == req.params.id)
   const recommendations = recommender.getSimilarDocuments(req.params.id, 0, 8)
   const apps = recommendations.length > 0 ?
      recommendations.map(el => db.find(app => app.id == el.id))
      : db.filter(app => app.genre == appData.genre && app.id != appData.id).slice(0, 8)
   if(appData != undefined)
      res.render('app', { app: appData, recommended: apps, similarBased: recommendations.length > 0 })
   else
      res.render('index', { title: 'No app found', message: 'No app with that id exists' })
})

app.listen(port, () => {
   // Server start
   console.log(`App listening at http://localhost:${port}`)
})
