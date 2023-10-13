// Підключаємо технологію express для back-end сервера
const express = require('express')
// Cтворюємо роутер - місце, куди ми підключаємо ендпоїнти
const router = express.Router()

// ================================================================

class Product {
	static #list = []
	static #count = 0

	constructor(img, title, description, category, price, amount = 0) {
		this.id = ++Product.#count; 							// Генеруємо унікальний id для товару
		this.img = img;
		this.title = title;
		this.description = description;
		this.category = category;
		this.price = price;												// Ціна товару, число
		this.amount = amount;
	}

	static add = (...data) => {
		const newProduct = new Product(...data)

		this.#list.push(newProduct)
	}

	static getList = () => {
		return this.#list;
	}

	static getById = (id) => {
		return this.#list.find((product) => product.id === id);
	}

	static getRandomList = (id) => {

		// Фільтруємо товари, щоб вилучити той, з яким порівнюємо id
		const filtredList = this.#list.filter((product) => product.id !== id);

		// Відсортуємо за допомогою Math.random() та перемішаємо масив
		const shuffledList = filtredList.sort(() => Math.random() - 0.5);

		// Повертаэмо перші 3 елементи з перемішаного масиву
		return shuffledList.slice(0, 3)
	}
}

Product.add(
	'https://picsum.photos/200/300',
	`Комп'ютер Artline Gaming (X43v31) AMD Ryzen 5 3600`,
	'AMD Ryzen 5 3600 (3.6 - 4.2 ГГц) / RAM 16 ГБ / HDD 1 ТБ + SSD 480 ГБ / nVidia GeForce RTX 3050, 8 ГБ / без ОД / LAN / без ОС',
	[
		{ id: 1, text: 'Готовий до відправки' },
		{ id: 2, text: 'Топ продажів' },
	],
	27000,
	10
)

Product.add(
	'https://picsum.photos/200/300',
	`Комп'ютер COBRA Advanced (I11F.8.H1S2.15T.13356) Intel`,
	'Intel Core i3-10100F (3.6 - 4.3 ГГц) / RAM 8 ГБ / HDD 1 ТБ + SSD 240 ГБ / GeForce GTX 1050 Ti, 4 ГБ / без ОД / LAN / Linux',
	[
		{ id: 2, text: 'Топ продажів' },
	],
	17000,
	10
)

Product.add(
	'https://picsum.photos/200/300',
	`Комп'ютер ARTLINE Gaming by ASUS TUF v119 (TUFv119)`,
	'Intel Core i9-13900KF (3.0 - 5.8 ГГц) / RAM 64 ГБ / SSD 2 ТБ (2 x 1 ТБ) / nVidia GeForce RTX 4070 Ti, 12 ГБ / без ОД / LAN / Wi-Fi / Bluetooth / без ОС',
	[
		{ id: 1, text: 'Готовий до відправки' },
	],
	113109,
	10
)

// ================================================================

class Purchase {
	static DELIVERY_PRICE = 150
}

// ================================================================

router.get('/', function (req, res) {
	res.render('purchase-index', {
		style: 'purchase-index',
		data: {
			list: Product.getList(),
		},
	})
})

// ================================================================

router.get('/purchase-product', function (req, res) {
	const id = Number(req.query.id)

	res.render('purchase-product', {
		style: 'purchase-product',
		data: {
			list: Product.getRandomList(id),
			product: Product.getById(id)
		},
	})
})

// ================================================================

router.post('/purchase-create', function (req, res) {
	const id = Number(req.query.id);
	const amount = Number(req.body.amount);
	// console.log(id, amount);

	if (amount < 1) {
		return res.render('alert', {
			style: 'alert',
			data: {
				message: 'Помилка',
				info: 'Некоректна кількість товару',
				link: `/purchase-product?id=${id}`
			},
		})
	}

	const product = Product.getById(id);
	if (product.amount < amount) {
		return res.render('alert', {
			style: 'alert',
			data: {
				message: 'Помилка',
				info: 'Такої кількості товару не має в наявності',
				link: `/purchase-product?id=${id}`
			},
		})
	}
	// console.log(product, amount);

	const productPrice = product.price * amount
	const totalPrice = productPrice + Purchase.DELIVERY_PRICE

	res.render('purchase-create', {
		style: 'purchase-create',
		data: {
			id: product.id,
			cart: [
				{
					text: `${product.title} (${amount} шт.)`,
					price: productPrice
				},
				{
					text: `Доставка`,
					price: Purchase.DELIVERY_PRICE
				},
			],
			totalPrice,
			productPrice,
			deliveryPrice: Purchase.DELIVERY_PRICE
		},
	})
})

// ================================================================

router.post('/purchase-submit', function (req, res) {
	console.log(req.query);
	console.log(req.body);

	res.render('alert', {
		style: 'alert',
		data: {
			message: 'Успішно',
			info: 'Замовлення створено',
			link: `/purchase-list`
		},
	})
})

// ================================================================

// Підключаємо роутер до бек-енду
module.exports = router
