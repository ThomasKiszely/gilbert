const User = require("../models/user");
const { userRoles } = require("../utils/userRoles");


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

async function updateSellerProfile(id, sellerProfile) {
    return await User.findByIdAndUpdate(
        id,
        {
            sellerProfile: {
                ...sellerProfile,
                isComplete: true,
                completedAt: new Date(),
            }
        },
        { new: true, runValidators: true }
    ).select("-passwordHash");
}


async function findUserById(id) {
    const user = await User.findById(id);
    return user;
}

async function findUserByToken(token) {
    const user = await User.findOne({ emailChangeToken: token });
    return user;
}

async function getAllUsersPaginated(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const statusOrder = {
        pending: 0,
        approved: 1,
        rejected: 2,
        none: 3
    };

    const users = await User.aggregate([
        {
            $addFields: {
                statusSortValue: {
                    $switch: {
                        branches: [
                            { case: { $eq: ["$professionalStatus", "pending"] }, then: 0 },
                            { case: { $eq: ["$professionalStatus", "approved"] }, then: 1 },
                            { case: { $eq: ["$professionalStatus", "rejected"] }, then: 2 },
                            { case: { $eq: ["$professionalStatus", "none"] }, then: 3 },
                            { case: { $eq: ["$professionalStatus", null] }, then: 4 }
                        ],
                        default: 5
                    }

                }
            }
        },
        { $sort: { statusSortValue: 1, username: 1 } },
        { $skip: skip },
        { $limit: limit },
        { $project: { passwordHash: 0, statusSortValue: 0 } }
    ]);

    const total = await User.countDocuments();

    return {
        users,
        total,
        totalPages: Math.ceil(total / limit),
        page
    };
}


async function updateUserRole(id, role) {
    return await User.findByIdAndUpdate(
        id,
        { role },
        { new: true, runValidators: true }
    ).select("-passwordHash");
}

async function updateProfessionalStatus(id, professionalStatus) {
    return await User.findByIdAndUpdate(
        id,
        { professionalStatus },
        { new: true, runValidators: true }
    ).select("-passwordHash");
}

async function updateUserBadges(id, badges) {
    return await User.findByIdAndUpdate(
        id,
        { badges },
        { new: true, runValidators: true }
    ).select("-passwordHash");
}

async function deleteUser(userId){
    return await User.findByIdAndDelete(userId);
}

async function searchUsers(query, limit = 10) {
    return await User.find({
        username: { $regex: query, $options: "i" }
    })
        .select("username _id profile.avatarUrl")
        .limit(limit);
}

async function findAdmins(){
    return await User.find({ role: userRoles.admin });
}

async function toggleUserSuspension(id, isSuspended, reason) {
    return await User.findByIdAndUpdate(
        id,
        { isSuspended: isSuspended, suspensionReason: reason },
        { new: true, runValidators: true }
        ).select("-passwordHash");
}


module.exports = {
    findUserByEmail,
    createUser,
    updateUser,
    findUserById,
    findUserByToken,
    getAllUsersPaginated,
    updateUserRole,
    updateProfessionalStatus,
    updateUserBadges,
    updateSellerProfile,
    deleteUser,
    searchUsers,
    findAdmins,
    toggleUserSuspension,
}