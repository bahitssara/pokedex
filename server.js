require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const POKEDEX = require('./pokedex.json')
const cors = require('cors')
const helmet = require('helmet')
const PORT = process.env.PORT || 8000
const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common'
const app = express()

app.use(morgan(morganSetting))
app.use(cors())
app.use(helmet())

app.use(function validateBearerToken(req, res, next) {
  const authToken = req.get('Authorization')
  const apiToken = process.env.API_TOKEN

  if (!authToken || authToken.split(' ')[1] !== apiToken) {
    return res.status(401).json({ error: 'Unauthorized request' })
  }
  // move to the next middleware
  next()
})

app.use((error, req, res, next) => {
  let response 
  if (process.env.NODE_ENV === 'production') {
    repsonse = {error: {message: 'server error'}}
  } else {
    response = { error }
  }
  res.status(500).json(response)
})

const validTypes = [`Bug`, `Dark`, `Dragon`, `Electric`, `Fairy`, `Fighting`, `Fire`, `Flying`, `Ghost`, `Grass`, `Ground`, `Ice`, `Normal`, `Poison`, `Psychich`, `Rock`, `Steel`, `Water`]

app.get('/types', function handleGetTypes(req, res) {
  res.json(validTypes)
})

app.get('/pokemon', function handleGetPokemon(req, res) {
  let response = POKEDEX.pokemon;

  // filter our pokemon by name if name query param is present
  if (req.query.name) {
    response = response.filter(pokemon =>
      // case insensitive searching
      pokemon.name.toLowerCase().includes(req.query.name.toLowerCase())
    )
  }

  // filter our pokemon by type if type query param is present
  if (req.query.type) {
    response = response.filter(pokemon =>
      pokemon.type.includes(req.query.type)
    )
  }

  res.json(response)
})

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`)
})