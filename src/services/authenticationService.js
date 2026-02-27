const orderRepo = require('../data/orderRepo');

async function verifyAuthentication(orderId, status, notes = "") {
    // 1. Find ordren
    const order = await orderRepo.findOrderById(orderId);
    if (!order) {
        throw new Error("Order not found");
    }

    // 2. Opdater authentication-status
    const updatedOrder = await orderRepo.updateAuthenticationStatus(orderId, {
        authenticationStatus: status,
        authenticationNotes: notes
    });

    // 3. Hvis authentication fejler → stop payout
    if (status === "failed") {
        await orderRepo.markOrderAsDisputed(orderId, "Authentication failed");
    }

    // 4. Hvis authentication er godkendt → fortsæt normal flow
    // (levering → 72 timer → payout via cron)
    return updatedOrder;
}

module.exports = {
    verifyAuthentication
};
