const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  try {
    const blog = new Blog(request.body)
    const result = await blog.save()
    response.status(201).json(result)
  } catch (error) {
    if (error.name === 'ValidationError') {
      return response.status(400).json({ error: error.message })
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
