const { test, beforeEach, describe, after } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const bcrypt = require('bcrypt');

const api = supertest(app)

const saltRounds = 10
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

    // Set passwordHash
    const initialUsersWithHash = [];
    for (let user of initialUsers) {
      user.passwordHash = await bcrypt.hash(user.password, saltRounds)
      initialUsersWithHash.push(user)
    }
    const userObjects = initialUsersWithHash
      .map(user => new User(user))
    const promiseArray2 = userObjects.map(user => user.save())
    await Promise.all(promiseArray2)

    // Link all blogs to the first user
    const user = await User.findOne({ username: 'michaelchan' })
    const blogs = await Blog.find({})
    user.blogs = blogs.map(blog => blog._id)
    await user.save()

    // For each blog set the author to the first user
    for (let blog of blogs) {
      blog.author = user._id
      await blog.save()
    }
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
    // Login first
    const loginResponse = await api
      .post('/api/login')
      .send({ username: 'michaelchan', password: 'testpassword' })
      .expect(200)

    const token = loginResponse.body.token

    const newBlog = {
      title: 'Test blog',
      url: 'https://www.testblog.com/',
      likes: 3,
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, initialBlogs.length + 1)
  })

  test('if likes property is missing, it defaults to 0', async () => {
    // Login first
    const loginResponse = await api
      .post('/api/login')
      .send({ username: 'michaelchan', password: 'testpassword' })
      .expect(200)

    const token = loginResponse.body.token

    const newBlog = {
      title: 'Test blog',
      author: 'Angeliki Fokou',
      url: 'https://www.testblog.com/',
    }

    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.likes, 0)
  })

  test('if title and url properties are missing, return 400', async () => {
    // Login first
    const loginResponse = await api
      .post('/api/login')
      .send({ username: 'michaelchan', password: 'testpassword' })
      .expect(200)

    const token = loginResponse.body.token

    const newBlog = {
      author: 'Angeliki Fokou',
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400)
  })

  test('user can delete a blog', async () => {
    // Login first
    const loginResponse = await api
      .post('/api/login')
      .send({ username: 'michaelchan', password: 'testpassword' })
      .expect(200)

    const token = loginResponse.body.token

    const response = await api.get('/api/blogs')
    const blogToDelete = response.body[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
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
