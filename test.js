'use strict'
const reviewsCrawler = require('./app.js')

reviewsCrawler('1503364127', function(err, reviews){
	if(err) throw err
	console.log(reviews)
})