import express, { json } from 'express'
import cors from 'cors'
import { randomUUID } from 'node:crypto'
import http from 'node:http'
import { createRequire } from 'node:module'
import { validateMovie, validatePartialMovie } from './schemas/validateMovie.js'

const require = createRequire(import.meta.url)

const movies = require('./movies.json')

const ACCEPTED_ORIGINS = [
  'http://localhost:8080'
]

const app = express()
app.disable('x-powered-by')

app.use(json())
app.use(cors({
  origin: (origin, callback) => {
    if (ACCEPTED_ORIGINS.includes(origin)) {
      return callback(null, true)
    }

    if (!origin) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed by CORS'))
  }
}))

app.get('/movies', (req, res) => {
  // const origin = req.header('origin')

  // if (ALLOWED_ORIGINS.includes(origin) || !origin) {
  //   res.header('Access-Control-Allow-Origin', origin)
  // }

  const { title, year, genre, director, rate } = req.query

  let filteredMovies = [...movies]

  if (title) {
    filteredMovies = filteredMovies.filter(movie => {
      const movieTitle = movie.title.toLocaleLowerCase()
      const search = title.toLocaleLowerCase()
      return movieTitle.includes(search)
    })
  }

  if (year) {
    filteredMovies = filteredMovies.filter(movie => {
      return movie.year.toString() === year
    })
  }

  if (genre) {
    filteredMovies = filteredMovies.filter(movie => {
      const movieGenre = movie.genre.toLocaleLowerCase()
      const search = genre.toLocaleLowerCase()
      return movieGenre.includes(search)
    })
  }

  if (filteredMovies.length === 0) {
    return res.status(404).json({ message: 'No movies found' })
  }

  res.json(filteredMovies)
})

app.get('/movies/:id', (req, res) => {
  const { id } = req.params

  const movie = movies.find(movie => movie.id === id)

  if (movie) {
    return res.json(movie)
  }
  res.status(404).json({ message: 'Movie not found' })
})

app.post('/movies', (req, res) => {
  const result = validateMovie(req.body)

  if (!result.success) {
    return res.status(400).json(JSON.parse(result.error.message))
  }
  const newMovie = {
    id: randomUUID(),
    ...result.data
  }

  movies.push(newMovie)

  res.status(201).json(newMovie)
})

app.patch('/movies/:id', (req, res) => {
  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }

  const result = validatePartialMovie(req.body)

  if (!result.success) {
    return res.status(400).json(JSON.parse(result.error.message))
  }

  const updateMovie = {
    ...movies[movieIndex],
    ...result.data
  }

  movies[movieIndex] = updateMovie

  res.json(updateMovie)
})

app.delete('/movies/:id', (req, res) => {
  // const origin = req.header('origin')
  // if (ALLOWED_ORIGINS.includes(origin) || !origin) {
  //   res.header('Access-Control-Allow-Origin', origin)
  // }

  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id.toString() === id)

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }

  const deletedMovie = movies.splice(movieIndex, 1)

  res.json({ message: 'Movie deleted', data: { ...deletedMovie } })
})

// app.options('/movies/:id', (req, res) => {
//   const origin = req.header('origin')

//   if (ALLOWED_ORIGINS.includes(origin) || !origin) {
//     res.header('Access-Control-Allow-Origin', origin)
//     res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
//   }

//   res.send()
// })

app.use((req, res) => res.status(404).send('<h1> 404 Not found </h1>'))

const PORT = process.env.PORT ?? 3000

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`)
})
