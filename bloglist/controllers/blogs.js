const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('author', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  try {
    const body = request.body
    const blog = new Blog({...body, author: request.user.id})
    const result = await blog.save()
    const user = await User
      .findById(request.user.id)
    user.blogs = user.blogs.concat(result._id)
    response.status(201).json(result)
  } catch (error) {
    if (error.name === 'ValidationError') {
      return response.status(400).json({ error: error.message })
    } else if (error.name ===  'JsonWebTokenError') {
      return response.status(401).json({ error: 'token invalid' })
    }

    response.status(500).json({ error: 'something went wrong' })
  }
})

blogsRouter.delete('/:id', async (request, response) => {
  try {
    const blog = await Blog.findByIdAndDelete(request.params.id)
    if (!request.user) {
      return response.status(401).json({ error: 'unauthorized' })
    }
    // Check if blog belongs to user
    if (blog.author.toString() !== request.user.id.toString()) {
      return response.status(401).json({ error: 'unauthorized' })
    }

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
