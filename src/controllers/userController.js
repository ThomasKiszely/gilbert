const userService = require("../services/userService");

async function updateUser(req, res, next) {
    try{
        const id = req.params.id;
        const user = req.body;
        const updatedUser = await userService.updateUser(id, user);
        return res.status(200).json({ success: true, data: updatedUser });
    } catch (error){
        next(error);
    }
}


module.exports = {
    updateUser,
}