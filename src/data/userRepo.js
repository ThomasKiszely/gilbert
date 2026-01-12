const User = require("../models/user");


async function findUserByEmail(email) {
    return await User.findOne({ email })
}

async function createUser(user) {
    const newUser = new User(user);
    return await newUser.save();
}

async function updateUser(id, user) {
    const updatedUser = User.findByIdAndUpdate(id, user, { new: true, runValidators: true });
    return updatedUser;
}

module.exports = {
    findUserByEmail,
    createUser,
    updateUser,
}