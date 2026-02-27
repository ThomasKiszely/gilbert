const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const userRepo = require('../data/userRepo');

async function createConnectAccount(userId) {
    const user = await userRepo.findUserById(userId);

    let stripeAccountId = user.stripeAccountId;

    if (!stripeAccountId) {
        const account = await stripe.accounts.create({
            type: 'express',
            country: 'DK',
            email: user.email,
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true },
            },
            business_type: 'individual',
        });

        stripeAccountId = account.id;
        await userRepo.updateStripeAccountId(userId, stripeAccountId);
    }

    const accountLink = await stripe.accountLinks.create({
        account: stripeAccountId,
        refresh_url: `${process.env.FRONTEND_URL}/settings/payouts?error=refresh`,
        return_url: `${process.env.FRONTEND_URL}/settings/payouts?success=true`,
        type: 'account_onboarding',
    });

    return accountLink.url;
}

async function createCheckoutSession(order) {
    // Vi populerer produktet hvis det ikke allerede er gjort i repo
    // (Antager at order.product er populatet fra din repo.findOrderById)

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
            price_data: {
                currency: 'dkk',
                product_data: {
                    name: order.product.title,
                    // images: [order.product.images[0]], // Valgfrit
                },
                unit_amount: order.totalAmount * 100, // Omregn til øre
            },
            quantity: 1,
        }],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
        metadata: {
            orderId: order._id.toString()
        }
    });

    // Husk at gemme session.id på ordren i din database!
    const orderRepo = require('../data/orderRepo');
    await orderRepo.updateOrderSession(order._id, session.id);

    return session;
}

module.exports = {
    createConnectAccount,
    createCheckoutSession,
};