const bcrypt = require('bcryptjs');

let users = []; // This will store user data in-memory

const addUser = (username, password) => {
  const hashedPassword = bcrypt.hashSync(password, 8);
  const user = { username, password: hashedPassword };
  users.push(user);
  return user;
};

const findUser = (username) => {
  return users.find(user => user.username === username);
};

const verifyPassword = (user, password) => {
  return bcrypt.compareSync(password, user.password);
};

module.exports = {
  addUser,
  findUser,
  verifyPassword,
};
