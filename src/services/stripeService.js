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


module.exports = {
    createConnectAccount,
};