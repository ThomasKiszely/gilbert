const userService = require("../services/userService");
const imageService = require("../services/imageService");

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

async function updateAvatar(req, res, next) {
    try{
        if(!req.file){
            return res.status(400).json({ success: false, message: 'No file uploaded.' });
        }
        console.log("REQ.FILE:", req.file);

        const avatarUrl = await imageService.saveAvatar(req.file);

        await userService.updateMe(req.user.id, {
            profile: {
                avatarUrl: avatarUrl,
            }
        });
        return res.status(200).json({ success: true, data: avatarUrl });

    } catch (error){
        next(error);
    }
}

async function changePassword(req, res, next) {
    try{
        const{ currentPassword, newPassword, confirmPassword } = req.body;

        if(!currentPassword || !newPassword || !confirmPassword){
            return res.status(400).json({ success: false, error: "All fields are required" });
        }

        const result = await userService.changePassword(
            req.user.id,
            currentPassword,
            newPassword,
            confirmPassword
        );
        return res.status(200).json({ success: true, message: "Password changed successfully." });
    } catch (error){
        next(error);
    }
}

async function changeEmail(req, res, next) {
    try{
        const { currentPassword, newEmail, confirmEmail } = req.body;
        if(!currentPassword || !newEmail || !confirmEmail){
            return res.status(400).json({ success: false, error: "All fields are required" });
        }
        const result = await userService.requestEmailChange(
            req.user.id,
            currentPassword,
            newEmail,
            confirmEmail
        );
        return res.status(200).json({ success: true, message: "Check your new email to confirm change." });
    } catch (error){
        next(error);
    }
}

async function verifyEmailChange(req, res, next) {
    try{
        const { token } = req.query;
        await userService.verifyEmailChange(token);
        return res.redirect("/email-change-success");
    } catch (error){
        return res.redirect("/email-change-error");
    }
}


module.exports = {
    updateUser,
    getMe,
    updateMe,
    updateAvatar,
    changePassword,
    changeEmail,
    verifyEmailChange,
}