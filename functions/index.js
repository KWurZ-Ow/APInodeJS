const functions = require("firebase-functions");
const admin = require('firebase-admin')
const express = require('express')
const app = express()
const routeurMovies = require("./routeurs/routerMovies")
const routeurCategories = require("./routeurs/routerCategories")

admin.initializeApp(functions.config().firebase)
const db = admin.firestore()

app.use("/v1/movies", routeurMovies(db))
app.use("/v1/categories", routeurCategories(db))

exports.api = functions.region('europe-west3').https.onRequest(app)