const { test, beforeEach, describe, after } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')

const api = supertest(app)

const initialUsers = [
  {
    username: 'michaelchan',
    name: 'Michael Chan',
    password: 'testpassword',
    blogs: [],
  },
  {
    username: 'edsgerw.dijkstra',
    name: 'Edsger W. Dijkstra',
    password: 'testpassword',
    blogs: [],
  },
]

const initialBlogs = [
  {
    _id: "5a422a851b54a676234d17f7",
    title: "React patterns",
    url: "https://reactpatterns.com/",
    likes: 7,
  },
  {
    _id: "5a422aa71b54a676234d17f8",
    title: "Go To Statement Considered Harmful",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
  },
]

describe('when there is initially some blogs saved', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    await User.deleteMany({})

    const blogObjects = initialBlogs
      .map(blog => new Blog(blog))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)

    const userObjects = initialUsers
      .map(user => new User(user))
    const promiseArray2 = userObjects.map(user => user.save())
    await Promise.all(promiseArray2)
  })

  test('there are two blogs', async () => {
    const response = await api.get('/api/blogs')

    assert.strictEqual(response.body.length, initialBlogs.length)
  })

  test('verify unique identifer is called id', async () => {
    const response = await api.get('/api/blogs')
    // Check that _id does not exist in any blog object
    // Check that id exists in any blog object
    response.body.forEach(blog => {
      assert.ok(blog.id)
      assert.strictEqual(blog._id, undefined)
    })
  })

  test('a valid blog can be added and total increases', async () => {
    const newBlog = {
      title: 'Test blog',
      url: 'https://www.testblog.com/',
      likes: 3,
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, initialBlogs.length + 1)
  })

  test('if likes property is missing, it defaults to 0', async () => {
    const newBlog = {
      title: 'Test blog',
      author: 'Angeliki Fokou',
      url: 'https://www.testblog.com/',
    }

    const response = await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.likes, 0)
  })

  test('if title and url properties are missing, return 400', async () => {
    const newBlog = {
      author: 'Angeliki Fokou',
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
  })

  test('user can delete a blog', async () => {
    const response = await api.get('/api/blogs')
    const blogToDelete = response.body[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const blogsAtEnd = await api.get('/api/blogs')
    assert.strictEqual(blogsAtEnd.body.length, initialBlogs.length - 1)
  })

  test('user cant delete a blog with invalid id', async () => {
    await api
      .delete('/api/blogs/123')
      .expect(400)
  })

  test('user can update the likes of a blog', async () => {
    const response = await api.get('/api/blogs')
    const blogToUpdate = response.body[0]

    const updatedBlog = {
      likes: 10,
    }

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedBlog)
      .expect(200)

    const blogsAtEnd = await api.get('/api/blogs')
    assert.strictEqual(blogsAtEnd.body[0].likes, 10)
  })

  after(async () => {
    await mongoose.connection.close()
  })
})
