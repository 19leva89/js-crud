// Підключаємо технологію express для back-end сервера
const express = require('express')
// Cтворюємо роутер - місце, куди ми підключаємо ендпоїнти
const router = express.Router()

// ================================================================

class User {
	static #list = []

	constructor(email, login, password) {
		this.email = email
		this.login = login
		this.password = password
		this.id = new Date().getTime()
	}

	verifyPassword = (password) => this.password === password

	static add = (user) => {
		this.#list.push(user);
	}

	static getList = () => {
		return this.#list;
	}

	static getById = (id) => {
		return this.#list.find((user) => user.id === id);
	}

	static deleteById = (id) => {
		const index = this.#list.findIndex((user) => user.id === id);

		if (index !== -1) {
			this.#list.splice(index, 1);
			return true;
		} else {
			return false;
		}
	}

	static updateById = (id, data) => {
		const user = this.getById(id);

		if (user) {
			this.update(user, data)
			return true
		} else {
			return false
		}
	}

	static update = (user, { email }) => {
		if (email) {
			user.email = email
		}
	}
}

class Product {
	static #list = []

	constructor(name, price, description) {
		this.name = name; 												// Текстова назва товару
		this.price = price;												// Ціна товару, число
		this.description = description;						// Текстовий опис товару
		this.id = this.generateUniqueId();
		this.createDate = new Date().toISOString(); 			// Додаємо поточну дату у форматі ISO
	}

	generateUniqueId() {
		// Генеруємо випадкове п'ятизначне число
		const min = 10000;
		const max = 99999;
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	static add = (product) => {
		this.#list.push(product);
	}

	static getList = () => {
		return this.#list;
	}

	static getById = (id) => {
		return this.#list.find((product) => product.id === id);
	}

	static updateById = (id, data) => {
		// Знаходимо товар за id
		const product = this.getById(id);

		if (product) {
			this.update(product, data)
			return true
		} else {
			return false
		}
	}

	static update = (product, { name, price, description }) => {
		if (name) {
			product.name = name;
		}
		if (price) {
			product.price = price;
		}
		if (description) {
			product.description = description;
		}
	}


	static deleteById = (id) => {
		// Знаходимо індекс товару за id
		const index = this.#list.findIndex((product) => product.id === id);

		if (index === -1) {
			console.log(`Товар з id ${id} не знайдено.`);
			return;
		}

		// Видаляємо товар зі списку
		this.#list.splice(index, 1);

		console.log(`Товар з id ${id} був успішно видалений.`);
	}
}

// ================================================================

// router.get Створює нам один ентпоїнт

// ↙️ тут вводимо шлях (PATH) до сторінки
router.get('/', function (req, res) {
	// res.render генерує нам HTML сторінку

	const list = User.getList()

	// ↙️ cюди вводимо назву файлу з сontainer
	res.render('index', {
		// вказуємо назву папки контейнера, в якій знаходяться наші стилі
		style: 'index',

		data: {
			users: {
				list,
				isEmpty: list.length === 0
			}
		}
	})
	// ↑↑ сюди вводимо JSON дані
})

// ================================================================

router.post('/user-create', function (req, res) {
	const { email, login, password } = req.body

	const user = new User(email, login, password)

	User.add(user)

	// console.log(User.getList())

	res.render('succes-info', {
		style: 'succes-info',
		info: "Користувач створений"
	})
})

// ================================================================

router.get('/user-delete', function (req, res) {
	const { id } = req.query

	// console.log(id)
	// console.log(typeof id)

	User.deleteById(Number(id))

	res.render('succes-info', {
		style: 'succes-info',
		info: "Користувач видалений"
	})
})

// ================================================================

router.post('/user-update', function (req, res) {
	const { email, password, id } = req.body
	let result = false
	const user = User.getById(Number(id))

	// console.log(email, password, id)
	// console.log(typeof email, typeof password, typeof id)

	if (user.verifyPassword(password)) {
		User.update(user, { email })
		result = true
	}

	res.render('succes-info', {
		style: 'succes-info',
		info: result ? "Email адреса оновлена" : "Сталася помилка"
	})
})

// ================================================================

router.get('/product-create', function (req, res) {

	res.render('product-create', {
		style: 'product-create',
	});
})

// ================================================================

router.post('/product-create', function (req, res) {
	const { name, price, description } = req.body

	if (!name || !price || !description) {
		res.render('alert', {
			style: 'alert',
			info: "Помилка: Будь ласка, вкажіть всі обов'язкові дані.",
			title: "Не успішне виконання дії"
		});
		return;
	}

	const product = new Product(name, price, description)

	Product.add(product)

	// console.log(name, price, description)
	// console.log(typeof name, typeof price, typeof description)
	// console.log(Product.getList())

	res.render('alert', {
		style: 'alert',
		info: "Товар створений",
		title: "Успішне виконання дії"
	})
})

// ================================================================

router.get('/product-list', function (req, res) {
	const list = Product.getList()

	res.render('product-list', {
		style: 'product-list',
		info: "Список товарів",
		data: {
			products: {
				list,
				isEmpty: list.length === 0
			}
		}
	});
})

// ================================================================

router.get('/product-edit', function (req, res) {
	const { id } = req.query
	const product = Product.getById(Number(id));

	if (product) {
		res.render('product-edit', {
			style: 'product-edit',
			info: 'Редагування товару',
			product: product, // Передача отриманого товару
		});
	} else {
		res.render('alert', {
			style: 'alert',
			info: 'Товар з таким ID не знайдено',
			title: 'Помилка'
		});
	}
})

// ================================================================

router.post('/product-edit', function (req, res) {
	const { id, name, price, description } = req.body

	// Знайти товар за ідентифікатором
	const product = Product.updateById(id, { name, price, description });


	// Оновити дані товару за ідентифікатором updateById
	res.render('alert', {
		style: 'alert',
		info: "Товар оновлений",
		title: "Успішне виконання дії"
	})
})

// ================================================================

// Підключаємо роутер до бек-енду
module.exports = router
