// Підключаємо технологію express для back-end сервера
const express = require('express')
// Cтворюємо роутер - місце, куди ми підключаємо ендпоїнти
const router = express.Router()

// ================================================================

class Track {

	// Статичне приватне поле для зберігання списку об'єктів Track
	static #list = []

	constructor(name, author, image) {
		this.id = Math.floor(1000 + Math.random() * 9000) // Генеруємо випадкове id
		this.name = name
		this.author = author
		this.image = image
	}

	// Статичний метод для створення об'єкту Track і додавання цого до списку #list
	static create(name, author, image) {
		const newTrack = new Track(name, author, image)
		this.#list.push(newTrack)
		return newTrack
	}

	// Статичний метод для отримання всього списку треків
	static getList() {
		return this.#list.reverse()
	}

	static getById(id) {
		return this.#list.find((track) => track.id === id);
	}
}

Track.create('Інь Ян', 'MONATIK і ROXOLLANA', 'https://picsum.photos/100/100')
Track.create('Baila Conmigo (Remix)', 'Selena Gomez і Rauw Alejandro', 'https://picsum.photos/100/100')
Track.create('Shameless', 'Camila Cabello ', 'https://picsum.photos/100/100')
Track.create('DÁKITI', 'BAD BUNNY і JHAY', 'https://picsum.photos/100/100')
Track.create('11 PM', 'Maluma', 'https://picsum.photos/100/100')
Track.create('Інша любов', 'Enleo', 'https://picsum.photos/100/100')

console.log(Track.getList())

// ================================================================

class Playlist {

	// Статичне приватне поле для зберігання списку об'єктів Playlist
	static #list = []

	constructor(name) {
		this.id = Math.floor(1000 + Math.random() * 9000) // Генеруємо випадкове id
		this.name = name
		this.tracks = []
	}

	// Статичний метод для створення об'єкту Playlist і додавання цого до списку #list
	static create(name) {
		const newPlaylist = new Playlist(name)
		this.#list.push(newPlaylist)
		return newPlaylist
	}

	// Статичний метод для отримання всього списку плейлістів
	static getList() {
		return this.#list.reverse()
	}

	static makeMix(playlist) {
		const allTracks = Track.getList()

		let randomTracks = allTracks
			.sort(() => 0.5 - Math.random())
			.slice(0, 3)

		playlist.tracks.push(...randomTracks)
	}

	static getById(id) {
		return (Playlist.#list.find((playList) => playList.id === id) || null)
	}

	deleteTrackById(trackId) {
		this.tracks = this.tracks.filter((track) => track.id !== trackId)
	}

	getTrack(trackId) {
		return this.tracks.find((track) => track.id === trackId);
	}

	addTrack(track) {
		this.tracks.push(track);
	}
}

// ================================================================

router.get('/', function (req, res) {
	const playlists = Playlist.getList(); // Отримати список плейлистів

	res.render('spotify-playlist-list', {
		style: 'spotify-playlist-list',
		data: {
			name: 'Моя бібліотека',
			playlists: playlists.map(playlist => ({
				id: playlist.id,
				name: playlist.name,
				trackCount: playlist.tracks.length,
				image: 'https://picsum.photos/285/285'

			})),
		},
	});
});

// ================================================================

router.get('/spotify-choose', function (req, res) {
	res.render('spotify-choose', {
		style: 'spotify-choose',
		data: {},
	})
})

// ================================================================

router.get('/spotify-create', function (req, res) {
	const isMix = !!req.query.isMix
	// console.log(isMix)

	res.render('spotify-create', {
		style: 'spotify-create',
		data: {
			isMix
		},
	})
})

// ================================================================

router.post('/spotify-create', function (req, res) {
	const isMix = !!req.query.isMix
	const name = req.body.name

	if (!name) {
		return res.render('alert', {
			style: 'alert',
			data: {
				message: 'Помилка',
				info: 'Введіть назву плейліста',
				link: isMix ? '/spotify-create?isMix=true' : '/spotify-create'
			},
		})
	}

	// console.log(req.body, req.query)

	const playList = Playlist.create(name)

	if (isMix) {
		Playlist.makeMix(playList)
	}

	// console.log(playList)

	res.render('spotify-playlist', {
		style: 'spotify-playlist',
		data: {
			playlistId: playList.id,
			tracks: playList.tracks,
			name: playList.name
		},
	})
})

// ================================================================

router.get('/spotify-playlist', function (req, res) {
	const id = Number(req.query.id)
	const playlist = Playlist.getById(id)

	if (!playlist) {
		return res.render('alert', {
			style: 'alert',
			data: {
				message: 'Помилка',
				info: 'Такого плейліста не знайдено',
				link: '/'
			},
		})
	}

	res.render('spotify-playlist', {
		style: 'spotify-playlist',
		data: {
			playlistId: playlist.id,
			tracks: playlist.tracks,
			name: playlist.name
		},
	})
})

// ================================================================

router.get('/spotify-playlist-add', function (req, res) {
	const playlistId = Number(req.query.playlistId); // Отримати ідентифікатор плейліста
	const playlist = Playlist.getById(playlistId);

	if (!playlist) {
		return res.render('alert', {
			style: 'alert',
			data: {
				message: 'Помилка',
				info: 'Такого плейліста не знайдено',
				link: '/'
			},
		})
	}

	// Отримати список всіх доступних пісень, з Track.getList()
	const allTracks = Track.getList();

	res.render('spotify-playlist-add', {
		style: 'spotify-playlist-add',
		data: {
			playlistId: playlist.id,
			tracks: allTracks,
			name: playlist.name
		},
	});
})

// ================================================================

router.get('/spotify-track-delete', function (req, res) {
	const playlistId = Number(req.query.playlistId)
	const trackId = Number(req.query.trackId)
	const playlist = Playlist.getById(playlistId)

	if (!playlist) {
		return res.render('alert', {
			style: 'alert',
			data: {
				message: 'Помилка',
				info: 'Такого плейліста не знайдено',
				link: `/spotify-playlist?id=${playlistId}`
			},
		})
	}

	playlist.deleteTrackById(trackId)

	res.render('spotify-playlist', {
		style: 'spotify-playlist',
		data: {
			playlistId: playlist.id,
			tracks: playlist.tracks,
			name: playlist.name
		},
	})
})

// ================================================================

router.get('/spotify-track-add', (req, res) => {
	const playlistId = Number(req.query.playlistId); // Отримати ідентифікатор плейліста
	const trackId = Number(req.query.trackId); // Отримати ідентифікатор пісні

	// Отримати плейліст та пісню за їхніми ідентифікаторами використовуючи нові статичні методи
	const playlist = Playlist.getById(playlistId);
	const track = Track.getById(trackId);

	if (!playlist) {
		return res.render('alert', {
			style: 'alert',
			data: {
				message: 'Помилка',
				info: 'Такого плейліста не знайдено',
				link: '/'
			},
		});
	}

	if (!track) {
		return res.render('alert', {
			style: 'alert',
			data: {
				message: 'Помилка',
				info: 'Такої пісні не знайдено',
				link: `/spotify-playlist-add?playlistId=${playlistId}`
			},
		});
	}

	// Додати пісню до плейлісту
	playlist.addTrack(track);

	// Після успішного додавання пісні виведіть сторінку плейліста з оновленим списком пісень
	res.render('spotify-playlist', {
		style: 'spotify-playlist',
		data: {
			playlistId: playlist.id,
			tracks: playlist.tracks,
			name: playlist.name
		},
	});
});

// ================================================================



// Підключаємо роутер до бек-енду
module.exports = router
