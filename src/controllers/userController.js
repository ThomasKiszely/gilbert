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

async function getMe(req, res, next) {
    try{
        const user = await userService.getMe(req.user._id);
        return res.status(200).json({ success: true, data: user });
    } catch (error){
        next(error);
    }
}

async function updateMe(req, res, next) {
    try{
        const user = req.body;
        const updated = await userService.updateMe(req.user.id, user);
        return res.status(200).json({ success: true, data: updated });
    } catch (error){
        next(error);
    }
}


module.exports = {
    updateUser,
    getMe,
    updateMe
}