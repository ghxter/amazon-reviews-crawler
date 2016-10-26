'use strict'

const Horseman = require('node-horseman')

const defaultOptions = {
	page: 'https://www.amazon.com/product-reviews/{{asin}}',
	elements: {
		// Searches whole page
		productTitle: '.product-title',
		reviewBlock: '.review',
		// Searches within elements.reviewBlock
		link: 'a',
		title: '.review-title',
		rating: '.review-rating',
		ratingPattern: 'a-star-',
		text: '.review-text',
		author: '.review-byline a',
		date: '.review-date'
	},
	stopAtReviewId: false
}

function crawlReview(asin, opt, cb){
	// Find options
	if(typeof opt === 'function'){
		cb = opt
		opt = defaultOptions
	}
	else if(typeof opt === 'object'){
		let i
		for(i in defaultOptions){
			if(!(i in opt)){
				opt[i] = defaultOptions[i]
			}
		}
	}

	const horseman = new Horseman()

	// Get latest reviewed ID

	horseman
		.open(opt.page.replace('{{asin}}', asin))
		.status()
		.then(status => {
			if(Number(status) >= 400){
				cb(false, `Page failed with status: ${status}`)
			}
		})
		.evaluate(function(opt){
			var reviews = document.querySelectorAll(opt.elements.reviewBlock)
			var title = document.querySelector(opt.elements.productTitle)
			title = title ? title.textContent : 'Not found'
			var arr = []


			for(var i = 0; i < reviews.length; i++){

				// Get review ID from link
				var els = {
					link: reviews[i].querySelector(opt.elements.link),
					title: reviews[i].querySelector(opt.elements.title),
					text: reviews[i].querySelector(opt.elements.text),
					rating: reviews[i].querySelector(opt.elements.rating),
					author: reviews[i].querySelector(opt.elements.author),
					date: reviews[i].querySelector(opt.elements.date)
				}
				if(els.link){
					var link = els.link.href
					var id = link.split('/')
					id = id[id.length - 2]
				}
				else{
					throw 'No link/ID found in reviews'
				}

				// If this is the most recent, stop crawling page
				if(opt.stopAtReviewId == id){
					break
				}

				// Trim date
				if(els.date){
					var date = els.date.textContent.trim()
					if(date.indexOf('on ') === 0){
						date = date.replace('on ', '')
					}
				}
				else{
					date = 'Not found'
				}

				// Put each in try statement
				arr[i] = {
					id: id,
					link: link,
					title: els.title ? els.title.textContent : 'Not found',
					text: els.text ? els.text.textContent : 'Not found',
					rating: els.rating,
					author: els.author ? els.author.textContent : 'Not found',
					date: date
				}
				// Get rating from class
				if(els.rating){
					var rat = els.rating.classList
					var found = false
					for(var ii = rat.length; ii--;){
						if(rat[ii].indexOf(opt.elements.ratingPattern) == 0){
							found = rat[ii].replace(opt.elements.ratingPattern, '')
							found = Number(found)
						}
					}
					arr[i].rating = found
				}
				else{
					arr[i].rating = 'Not found'
				}
			}

			return {
				title: title,
				reviews: arr
			}
		}, opt)
		.then(content => {
			// Callback with review content
			cb(content)
		})
		.catch(err => {
			cb(false, err)
		})
		.close()
}

crawlReview('0062472100', (err, content) => {
	if(err) throw err
	console.log(content)
})


module.exports = crawlReview



