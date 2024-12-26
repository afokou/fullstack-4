const { test, beforeEach, describe, after } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')

const api = supertest(app)

const initialUsers = [
  {
    username: 'testuser',
    name: 'Test User',
    password: 'testpassword',
    blogs: [],
  },
];

describe('when there is initially some users saved', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const userObjects = initialUsers
      .map(user => new User(user))
    const promiseArray = userObjects.map(user => user.save())
    await Promise.all(promiseArray)
  })

  test('a valid user can be added and total increases', async () => {
    const newUser = {
      username: 'afokou',
      name: 'Angeliki Fokou',
      password: 'testpassword',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/users')
    assert.strictEqual(response.body.length, initialUsers.length + 1)

    const usernames = response.body.map(user => user.username)
    assert.ok(usernames.includes(newUser.username))
  })

  test('a user with password less than 3 characters is not added', async () => {
    const newUser = {
      username: 'testuser',
      name: 'Test User',
      password: '12',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
  })

  test('a user with duplicate username is not added', async () => {
    const newUser = {
      username: 'afokou',
      name: 'Angeliki Fikou',
      password: 'testpassword',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
  })

  after(() => {
    mongoose.connection.close()
  })
})
