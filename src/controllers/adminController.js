const adminService = require('../services/adminService');

async function getAllProducts(req, res, next) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const products = await adminService.adminGetAllProducts(page, limit);

        if(!products) {
            const err = new Error('Not Found all products');
            err.status = 400;
            return next(err);
        }
        return res.status(200).json(products);
    } catch (error) {
        next(error);
    }
}

async function getProductsInReview(req, res, next) {
    try {
        const products = await adminService.getProductsInReview();

        if(!products) {
            const err = new Error('Not Found products in review');
            err.status = 400;
            return next(err);
        }
        return res.status(200).json(products);
    } catch (error) {
        next(error);
    }
}


async function approveProduct(req, res, next) {
    try {
        const updated = await adminService.updateStatusProduct(req.params.id, "Approved");
        if(!updated) {
            const err = new Error('Could not approve product with id "' + req.params.id + '"');
            err.status = 400;
            return next(err);
        }
        return res.status(200).json(updated);
    } catch (error) {
        next(error);
    }
}

async function rejectProduct(req, res, next) {
    try {
        const updated = await adminService.updateStatusProduct(req.params.id, "Rejected");
        if(!updated) {
            const err = new Error('Could not reject product with id "' + req.params.id + '"');
            err.status = 400;
            return next(err);
        }
        return res.status(200).json(updated);
    } catch (error) {
        next(error);
    }
}

async function getAllUsersPaginated(req, res, next) {
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await adminService.getAllUsersPaginated(page, limit);
        return res.status(200).json({
            success: true,
            ...result
        });
    } catch(error) {
        next(error);
    }
}

async function getUserById(req, res, next) {
    try{
        const id = req.params.id;
        const user = await adminService.getUserById(id);
        return res.status(200).json({ success: true, data: user });
    } catch(error) {
        next(error);
    }
}

async function updateUserBadges(req, res, next) {
    try{
        const id = req.params.id;
        const badges = req.body.badges;
        const updated = await adminService.updateUserBadges(id, badges);
        return res.status(200).json({ success: true, data: updated });
    } catch(error) {
        next(error);
    }
}

async function updateUserRole(req, res, next) {
    try{
        const id = req.params.id;
        const role = req.body.role;
        const user = await adminService.updateUserRole(id, role);
        return res.status(200).json({ success: true, data: user });
    } catch(error) {
        next(error);
    }
}

async function updateProfessionalStatus(req, res, next) {
    try{
        const id = req.params.id;
        const professionalStatus = req.body.professionalStatus;
        const user = await adminService.updateProfessionalStatus(id, professionalStatus);
        return res.status(200).json({ success: true, data: user });
    } catch (error){
        next(error);
    }
}

async function toggleUserSuspension(req, res, next) {
    try{
        const { id } = req.params;
        const { isSuspended, reason } = req.body;
        const suspended = await adminService.toggleUserSuspension(id, isSuspended, reason);
        return res.status(200).json({ success: true, data: suspended });
    } catch(error) {
        next(error);
    }
}

async function retryShippingLabel(req, res, next) {
    try{
        const result = await adminService.retryShippingLabel(req.params.id);
        return res.status(200).json( { success: true, data: result });
    } catch(error) {
        next(error);
    }
}

async function getAllOrders(req, res, next) {
    try {
        const { status, hasError } = req.query;

        // Vi kalder servicen
        const orders = await adminService.getAllOrders({ status, hasError });

        return res.status(200).json({
            success: true,
            data: orders
        });
    } catch (error) {
        next(error);
    }
}

// Admin: fetch a product by id regardless of status (preview)
async function getProductById(req, res, next) {
    try {
        const id = req.params.id;
        const product = await adminService.getProductForAdmin(id);
        if (!product) {
            const err = new Error('Product not found');
            err.status = 404;
            return next(err);
        }
        return res.status(200).json(product);
    } catch (error) {
        next(error);
    }
}

async function getOrderDetails(req, res, next) {
    try {
        const { id } = req.params;
        const order = await adminService.getOrderDetails(id);

        if (!order) {
            const err = new Error('Order not found');
            err.status = 404;
            return next(err);
        }

        return res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        next(error);
    }
}

async function resolveDispute(req, res, next) {
    try {
        const { id } = req.params;
        const { resolution, reason } = req.body; // 'refund_buyer' eller 'payout_seller'

        const result = await adminService.resolveDispute(id, resolution, reason);
        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

async function requestReturn(req, res, next) {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const result = await adminService.requestReturn(id, reason);

        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}
async function markOrderDeliveredToBuyer(req, res, next) {
    try {
        const { id } = req.params;

        const updated = await adminService.markOrderDeliveredToBuyer(id);

        return res.status(200).json({
            success: true,
            message: "Order marked as delivered to buyer. 72-hour payout timer started.",
            data: updated
        });
    } catch (error) {
        next(error);
    }
}




module.exports = {
    approveProduct,
    rejectProduct,
    getProductsInReview,
    getAllProducts,
    getAllUsersPaginated,
    getUserById,
    updateUserBadges,
    updateProfessionalStatus,
    updateUserRole,
    toggleUserSuspension,
    retryShippingLabel,
    getAllOrders,
    getOrderDetails,
    resolveDispute,
    requestReturn,
    markOrderDeliveredToBuyer,
    getProductById,
}