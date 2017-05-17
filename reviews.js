'use strict'
const reviewsCrawler = require('./app.js')

reviewsCrawler('B06Y2Z7HK4', function(err, reviews){
	if(err) throw err
	console.log(reviews)
})
