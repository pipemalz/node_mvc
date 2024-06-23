import express, { json } from 'express'
import corsMiddleware from './middlewares/cors.js'
import moviesRouter from './routes/movies.js'

const app = express()
app.disable('x-powered-by')

app.use(json())
app.use(corsMiddleware())
app.use('/movies', moviesRouter)

app.use((req, res) => res.status(404).send('<h1> 404 Not found </h1>'))

const PORT = process.env.PORT ?? 3000

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`)
})
