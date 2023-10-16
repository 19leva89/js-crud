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
	static #BONUS_FACTOR = 0.1

	static #count = 0
	static #list = []

	static #bonusAccount = new Map()

	static getBonusBalance = (email) => {
		return Purchase.#bonusAccount.get(email) || 0
	}

	static updateBonusBalance = (email, price, bonusUse = 0) => {
		const amount = price * Purchase.#BONUS_FACTOR
		const currentBallance = Purchase.getBonusBalance(email)
		const updateBalance = currentBallance + amount - bonusUse
		Purchase.#bonusAccount.set(email, updateBalance)

		console.log(email, updateBalance)

		return amount
	}

	constructor(data, product) {
		this.id = ++Purchase.#count

		this.firstname = data.firstname
		this.lastname = data.lastname

		this.phone = data.phone
		this.email = data.email

		this.comment = data.comment || null

		this.bonus = data.bonus || 0

		this.promocode = data.promocode || null

		this.totalPrice = data.totalPrice
		this.productPrice = data.productPrice
		this.deliveryPrice = data.deliveryPrice
		this.amount = data.amount

		this.product = product
	}

	static add = (...arg) => {
		const newPurchase = new Purchase(...arg)
		this.#list.push(newPurchase)
		return newPurchase
	}

	static getList = () => {
		return Purchase.#list.reverse();
	}

	static getById = (id) => {
		return Purchase.#list.find((item) => item.id === id);
	}

	static updateById = (id, data) => {
		const purchase = Purchase.getById(id)

		if (purchase) {
			if (data.firstname) {
				purchase.firstname = data.firstname
			}
			if (data.lastname) {
				purchase.lastname = data.lastname
			}
			if (data.phone) {
				purchase.phone = data.phone
			}
			if (data.email) {
				purchase.email = data.email
			}
			return true
		} else {
			return false
		}
	}
}

// ================================================================

class Promocode {
	static #list = []

	constructor(name, factor) {
		this.name = name
		this.factor = factor
	}

	static add = (name, factor) => {
		const newPromoCode = new Promocode(name, factor)
		Promocode.#list.push(newPromoCode)
		return newPromoCode
	}

	static getByName = (name) => {
		return this.#list.find((promo) => promo.name === name);
	}

	static calc = (promo, price) => {
		return price * promo.factor;
	}
}

Promocode.add('SUMMER2023', 0.9)
Promocode.add('DISCOUNT50', 0.5)
Promocode.add('SALE25', 0.75)

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
			deliveryPrice: Purchase.DELIVERY_PRICE,
			amount
		},
	})
	// console.log(totalPrice, amount);
})

// ================================================================

router.post('/purchase-submit', function (req, res) {
	const id = Number(req.query.id)

	let {
		totalPrice,
		productPrice,
		deliveryPrice,
		amount,

		firstname,
		lastname,
		email,
		phone,
		comment,

		promocode,
		bonus
	} = req.body

	// console.log(req.query);
	// console.log(req.body);
	// console.log(deliveryPrice, amount);

	const product = Product.getById(id)

	if (!product) {
		return res.render('alert', {
			style: 'alert',
			data: {
				message: 'Помилка',
				info: 'Товар не знайдено',
				link: `/purchase-list`
			},
		})
	}

	if (product.amount < amount) {
		return res.render('alert', {
			style: 'alert',
			data: {
				message: 'Помилка',
				info: 'Товару немає в потрібній кількості',
				link: `/purchase-list`
			},
		})
	}

	totalPrice = Number(totalPrice)
	productPrice = Number(productPrice)
	deliveryPrice = Number(deliveryPrice)
	amount = Number(amount)
	bonus = Number(bonus)

	if (isNaN(totalPrice) || isNaN(productPrice) || isNaN(deliveryPrice) || isNaN(amount) || isNaN(bonus)) {
		return res.render('alert', {
			style: 'alert',
			data: {
				message: 'Помилка',
				info: 'Некоректні дані',
				link: `/purchase-list`
			},
		})
	}

	if (!firstname || !lastname || !email || !phone) {
		return res.render('alert', {
			style: 'alert',
			data: {
				message: `Заповніть обов'язково всі поля`,
				info: 'Некоректні дані',
				link: `/purchase-list`
			},
		})
	}

	if (bonus || bonus > 0) {
		const bonusAmount = Purchase.getBonusBalance(email)

		console.log(bonusAmount);

		if (bonus > bonusAmount) {
			bonus = bonusAmount
		}

		Purchase.updateBonusBalance(email, totalPrice, bonus)
		totalPrice -= bonus

	} else {
		Purchase.updateBonusBalance(email, totalPrice, 0)
	}

	if (promocode) {
		promocode = Promocode.getByName(promocode)

		if (promocode) {
			totalPrice = Promocode.calc(promocode, totalPrice)
		}
	}

	if (totalPrice < 0) {
		totalPrice = 0
	}

	const purchase = Purchase.add(
		{
			totalPrice,
			productPrice,
			deliveryPrice,
			amount,
			bonus,

			firstname,
			lastname,
			email,
			phone,

			promocode,
			comment
		},
		product
	)

	console.log(purchase)

	res.render('alert', {
		style: 'alert',
		data: {
			message: `Успішно`,
			info: 'Замовлення створено',
			link: `/purchase-list`
		},
	})
})

// ================================================================

// Підключаємо роутер до бек-енду
module.exports = router
