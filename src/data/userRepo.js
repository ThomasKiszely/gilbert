const User = require("../models/user");


async function findUserByEmail(email) {
    return await User.findOne({ email })
}

async function createUser(user) {
    const newUser = new User(user);
    return await newUser.save();
}

async function updateUser(id, user) {
    const updatedUser = await User.findByIdAndUpdate(id, user, { new: true, runValidators: true });
    return updatedUser;
}

async function findUserById(id) {
    const user = await User.findById(id);
    return user;
}

module.exports = {
    findUserByEmail,
    createUser,
    updateUser,
    findUserById,
}