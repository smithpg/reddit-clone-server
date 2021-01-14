const mongoose = require("mongoose");
const { User, Post, Comment } = require("../models/index");
const faker = require("faker");
const _ = require("lodash");

const DEFAULT_PASSWORD = "password";

function dropAllCollections() {
  return mongoose.connection.db.dropDatabase();
}

function createUser(options = {}) {
  const { email, name } = faker.helpers.userCard();

  return User.create({
    email,
    name,
    password: DEFAULT_PASSWORD,
  });
}

function createPost(userId, options = {}) {
  return Post.create({
    user: userId,
    text: faker.lorem.paragraphs(),
  });
}

function createComment(userId, postId, parentId = null) {
  const data = {
    user: userId,
    post: postId,
    text: faker.lorem.sentences(),
  };

  if (parentId) {
    data.parent = parentId;
  }

  return Comment.create(data);
}

async function populateDB() {
  const users = await Promise.all(
    Array(100)
      .fill(0)
      .map(() => {
        return createUser();
      })
  );

  const posts = await Promise.all(
    Array(25)
      .fill(0)
      .map(() => {
        const userId = _.sample(users)._id;

        return createPost(userId);
      })
  );

  const comments = await Promise.all(
    Array(25)
      .fill(0)
      .map(() => {
        const userId = _.sample(users)._id;
        const postId = _.sample(posts)._id;

        return createComment(userId, postId);
      })
  );

  const replies = await Promise.all(
    Array(25)
      .fill(0)
      .map(() => {
        const userId = _.sample(users)._id;
        const { _id: parentId, post: postId } = _.sample(comments);

        return createComment(userId, postId, parentId);
      })
  );
}

module.exports = {
  dropAllCollections,
  populateDB,
  createComment,
  createUser,
  createPost,
};
