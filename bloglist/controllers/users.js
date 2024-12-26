const usersRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', { title: 1, author: 1, url: 1, id: 1 })
  response.json(users)
})

usersRouter.post('/', async (request, response) => {
  try {
    const { username, name, password } = request.body

    // Check if user exists
    const existingUser = await User
      .findOne({ username })
    if (existingUser) {
      return response.status(400).json({ error: 'Username must be unique' })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // If password is less than 3 characters return 400
    if (password.length < 3) {
      return response.status(400).json({ error: 'Password must be at least 3 characters long' })
    }

    const user = new User({
      username,
      name,
      passwordHash,
    })
    const result = await user.save()
    response.status(201).json(result)
  } catch (error) {
    if (error.name === 'ValidationError') {
      return response.status(400).json({ error: error.message })
    }
  }
})

usersRouter.delete('/:id', async (request, response) => {
  try {
    await User.findByIdAndDelete(request.params.id)

    response.status(204).end()
  } catch (error) {
    response.status(400).json({ error: 'invalid id' })
  }
})

usersRouter.put('/:id', async (request, response) => {
  const updatedUser = {
    username: request.body.username,
    name: request.body.name,
    password: request.body.password,
  }

  const result = await User
    .findByIdAndUpdate(request.params.id, updatedUser, { new: true })
  response.json(result)

  response.status(204).end()
})

module.exports = usersRouter
