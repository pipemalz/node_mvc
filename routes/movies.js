import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import { validateMovie, validatePartialMovie } from '../schemas/validateMovie.js'
import readJSON from '../utils.js'

const movies = readJSON('./movies.json')

const moviesRouter = Router()

export default moviesRouter

moviesRouter.get('/', (req, res) => {
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

moviesRouter.get('/:id', (req, res) => {
  const { id } = req.params

  const movie = movies.find(movie => movie.id === id)

  if (movie) {
    return res.json(movie)
  }
  res.status(404).json({ message: 'Movie not found' })
})

moviesRouter.post('/', (req, res) => {
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

moviesRouter.patch('/:id', (req, res) => {
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

moviesRouter.delete('/:id', (req, res) => {
  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id.toString() === id)

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }

  const deletedMovie = movies.splice(movieIndex, 1)

  res.json({ message: 'Movie deleted', data: { ...deletedMovie } })
})
