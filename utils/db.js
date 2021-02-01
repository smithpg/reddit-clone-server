const mongoose = require("mongoose");
const {
  User,
  Post,
  Comment,
  PostVote,
  CommentVote,
} = require("../models/index");
const faker = require("faker");
const _ = require("lodash");

const DEFAULT_PASSWORD = "password";

function dropAllCollections() {
  if (mongoose.connection.db) {
    return mongoose.connection.db.dropDatabase();
  } else {
    return new Promise((resolve, reject) => {
      mongoose.connection.on("connected", () => {
        resolve(mongoose.connection.db.dropDatabase());
      });
    });
  }
}

function createUser(options = {}) {
  const { email, username } = faker.helpers.userCard();

  return User.create({
    email,
    username,
    password: DEFAULT_PASSWORD,
    ...options,
  });
}

function createPost(userId, options = {}) {
  return Post.create({
    user: userId,
    text: faker.lorem.paragraphs(),
    title: faker.lorem.words(),
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

  posts.forEach(async (post) => {
    // Generate a random number of upvotes and downvotes
    const upvoteCount = _.random(1, 50);
    const downvoteCount = _.random(1, 50);

    // Create documents for each vote, selecting a different
    // user for each
    for (let i = 0; i < upvoteCount + downvoteCount; i++) {
      const isUpvote = i < upvoteCount;

      await PostVote.create({
        post: post._id,
        user: users[i]._id,
        isUpvote: isUpvote,
      });
    }
  });

  for (let i = 0; i < posts.length; i++) {
    const userId = _.sample(users)._id;
    const postId = posts[i]._id;
    const numComments = _.random(2, 50);
    const numReplies = _.random(2, 50);

    const comments = await Promise.all(
      Array(numComments)
        .fill(0)
        .map(() => createComment(userId, postId))
    );

    // Create some replies to randomly selected
    // comments on this post
    await Promise.all(
      Array(numReplies)
        .fill(0)
        .map(() => {
          const userId = _.sample(users)._id;
          const { _id: parentId, post: postId } = _.sample(comments);

          return createComment(userId, postId, parentId);
        })
    );
  }
}

module.exports = {
  dropAllCollections,
  populateDB,
  createComment,
  createUser,
  createPost,
};
