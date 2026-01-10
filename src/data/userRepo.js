const User = require("../models/user");


async function findUserByEmail(email) {
    return await User.findOne({ email })
}

async function createUser(user) {
    const newUser = new User(user);
    return await newUser.save();
}

module.exports = {
    findUserByEmail,
    createUser,
}