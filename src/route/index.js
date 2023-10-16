// Підключаємо технологію express для back-end сервера
const express = require('express')
// Cтворюємо роутер - місце, куди ми підключаємо ендпоїнти
const router = express.Router()

// ================================================================

router.get('/', function (req, res) {
	res.render('spotify-choose', {
		style: 'spotify-choose',
		data: {},
	})
})

// ================================================================

router.get('/spotify-create', function (req, res) {
	res.render('spotify-create', {
		style: 'spotify-create',
		data: {},
	})
})

// ================================================================

// Підключаємо роутер до бек-енду
module.exports = router
