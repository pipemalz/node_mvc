import z from 'zod'

const movie = z.object({
  title: z.string().max(200),
  year: z.number().int().min(1900).max(2025),
  director: z.string().max(200),
  duration: z.number().int().min(1).max(1000),
  poster: z.string().url(),
  genre: z.array(z.enum([
    'Drama',
    'Action',
    'Crime',
    'Adventure',
    'Sci-Fi',
    'Romance',
    'Animation',
    'Biography',
    'Fantasy'
  ]))
})

function validateMovie(object) {
  return movie.safeParse(object)
}

function validatePartialMovie(object) {
  return movie.partial().safeParse(object)
}

export { validateMovie, validatePartialMovie }
