const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const userRepo = require('../data/userRepo');

async function createConnectAccount(userId) {
    const user = await userRepo.findUserById(userId);

    let stripeAccountId = user.stripeAccountId;
    console.log("OPRETTER STRIPE-KONTO MED URL:", "https://github.com/SpeedosDK");

    if (!stripeAccountId) {
        const account = await stripe.accounts.create({
            type: 'express',
            country: 'DK',
            email: user.email,
            business_type: 'individual',
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true },
            },
            business_profile: {
                product_description: "Private seller on Gilbert marketplace",
                url: "https://github.com/SpeedosDK"
            }
        });

        stripeAccountId = account.id;
        await userRepo.updateStripeAccountId(userId, stripeAccountId);
    }

    const status = await checkStripeAccountStatus(stripeAccountId);

    if (status.needsOnboarding) {
        const link = await stripe.accountLinks.create({
            account: stripeAccountId,
            refresh_url: `${process.env.FRONTEND_URL}/settings/payouts?error=refresh`,
            return_url: `${process.env.FRONTEND_URL}/settings/payouts?success=true`,
            type: 'account_onboarding',
        });

        return link.url;
    }

    return null;
}

async function checkStripeAccountStatus(stripeAccountId) {
    const acct = await stripe.accounts.retrieve(stripeAccountId);

    const transfersActive = acct.capabilities?.transfers === "active";
    const cardPaymentsActive = acct.capabilities?.card_payments === "active";

    const missing = acct.requirements?.currently_due || [];

    return {
        transfersActive,
        cardPaymentsActive,
        missing,
        needsOnboarding: !transfersActive || missing.length > 0,
        account: acct
    };
}

// ⭐ DENNE FUNKTION MANGLER – DU SKAL HAVE DEN MED
async function getStripeStatus(req, res) {
    try {
        const user = await userRepo.findUserById(req.user._id);

        if (!user.stripeAccountId) {
            return res.json({
                hasStripeAccount: false,
                needsOnboarding: true,
                transfersActive: false,
                cardPaymentsActive: false,
                onboardingUrl: null
            });
        }

        const status = await checkStripeAccountStatus(user.stripeAccountId);

        let onboardingUrl = null;
        if (status.needsOnboarding) {
            const link = await stripe.accountLinks.create({
                account: user.stripeAccountId,
                refresh_url: `${process.env.FRONTEND_URL}/settings/payouts?error=refresh`,
                return_url: `${process.env.FRONTEND_URL}/settings/payouts?success=true`,
                type: 'account_onboarding',
            });
            onboardingUrl = link.url;
        }

        res.json({
            hasStripeAccount: true,
            needsOnboarding: status.needsOnboarding,
            transfersActive: status.transfersActive,
            cardPaymentsActive: status.cardPaymentsActive,
            missing: status.missing,
            onboardingUrl
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch Stripe status" });
    }
}

module.exports = {
    createConnectAccount,
    getStripeStatus
};
