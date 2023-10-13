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
			// console.log(`Товар з id ${id} не знайдено.`);
			return;
		}

		// Видаляємо товар зі списку
		this.#list.splice(index, 1);

		// console.log(`Товар з id ${id} був успішно видалений.`);
	}
}

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
		res.render('product-alert', {
			style: 'product-alert',
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

	res.render('product-alert', {
		style: 'product-alert',
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
			data: {
				name: product.name,
				price: product.price,
				id: product.id,
				description: product.description,
			},
		});
	} else {
		res.render('product-alert', {
			style: 'product-alert',
			info: 'Товар з таким ID не знайдено',
			title: 'Помилка'
		});
	}
})

// ================================================================

router.post('/product-edit', function (req, res) {
	const { id, name, price, description } = req.body

	// Знайти товар за ідентифікатором
	const product = Product.updateById(Number(id), { name, price, description });


	// Оновити дані товару за ідентифікатором updateById
	if (product) {
		res.render('product-alert', {
			style: 'product-alert',
			info: 'Інформація про товар оновлена',
			title: "Успішне виконання дії"
		})
	} else {
		res.render('product-alert', {
			style: 'product-alert',
			info: 'Сталася помилка',
			title: "Не успішне виконання дії"
		})
	}
})

// ================================================================

router.get('/product-delete', function (req, res) {
	const { id } = req.query

	// console.log(id)
	// console.log(typeof id)

	const product = Product.deleteById(Number(id));

	if (!product) {
		res.render('product-alert', {
			style: 'product-alert',
			info: 'Товар видалений',
			title: "Успішне виконання дії"
		})
	} else {
		res.render('product-alert', {
			style: 'product-alert',
			info: 'Сталася помилка',
			title: "Не успішне виконання дії"
		})
	}
})
