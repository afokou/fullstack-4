const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('author', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  try {
    const body = request.body
    const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
    if (!decodedToken.id) {
      return response.status(401).json({ error: 'token invalid' })
    }
    const user = await User.findById(decodedToken.id)
    const blog = new Blog({...body, author: user._id})
    const result = await blog.save()
    user.blogs = user.blogs.concat(result._id)
    response.status(201).json(result)
  } catch (error) {
    if (error.name === 'ValidationError') {
      return response.status(400).json({ error: error.message })
    } else if (error.name ===  'JsonWebTokenError') {
      return response.status(401).json({ error: 'token invalid' })
    }
  }
})

blogsRouter.delete('/:id', async (request, response) => {
  try {
    await Blog.findByIdAndDelete(request.params.id)

    response.status(204).end()
  } catch (error) {
    response.status(400).json({ error: 'invalid id' })
  }
})

blogsRouter.put('/:id', async (request, response) => {
  const updatedBlog = {
    likes: request.body.likes,
  }

  const result = await Blog
    .findByIdAndUpdate(request.params.id, updatedBlog, { new: true })
  response.json(result)

  response.status(204).end()
})

module.exports = blogsRouter
