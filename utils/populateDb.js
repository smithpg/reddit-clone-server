const { createUser, populateDB, dropAllCollections } = require("./db");

async function main() {
  await dropAllCollections();

  await populateDB();

  // Create user for manual testing
  await createUser({
    username: "test_user",
    email: "test_user@email.com",
    password: "password",
  });

  console.log("Done populating DB.");

  process.exit(0);
}

main();
