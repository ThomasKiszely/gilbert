const orderRepo = require('../data/orderRepo');
const productRepo = require('../data/productRepo');
const bidRepo = require('../data/bidRepo');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const mailer = require('../utils/mailer'); // ⭐ Ny import
const shippingService = require('./shippingService'); // ⭐ Sørg for at denne er her

const bidStatusses = require('../utils/bidStatusses');

const {
    PLATFORM_FEE_PERCENT,
    AUTHENTICATION_FEE,
    AUTH_THRESHOLD
} = require('../utils/platformSettings');


async function initiateOrder(productId, buyerId, bidId = null, wantAuth = false) {
    // 1. Hent produktet og valider status
    const product = await productRepo.getProductById(productId);
    if (!product || product.status !== 'Approved') {
        throw new Error("Product is not available for purchase");
    }

    let finalPrice = product.price;

    // 2. Valider bud hvis et bidId er medsendt
    if (bidId) {
        const bid = await bidRepo.getBidById(bidId);
        if (!bid || bid.productId.toString() !== productId.toString()) {
            throw new Error("The offer is no longer valid for this product");
        }
        if (bid.status !== bidStatusses.accepted) {
            throw new Error("This offer has not been accepted by the seller");
        }
        if (bid.buyerId.toString() !== buyerId.toString()) {
            throw new Error("This offer does not belong to your account");
        }
        // Brug bud-prisen
        finalPrice = bid.counterAmount || bid.amount;
    }

    // 3. Authentication logik (Gilbert-tjek)
    const isAuthForced = finalPrice >= AUTH_THRESHOLD;
    const requiresAuthentication = isAuthForced || wantAuth;
    const currentAuthFee = requiresAuthentication ? AUTHENTICATION_FEE : 0;

    // 4. Beregn økonomi (Altid i øre til Stripe)
    const platformFee = Math.round(finalPrice * (PLATFORM_FEE_PERCENT / 100));
    const sellerPayout = finalPrice - platformFee;
    const totalAmount = finalPrice + currentAuthFee;

    // 5. Forbered ordre-data til databasen
    const orderData = {
        product: productId,
        buyer: buyerId,
        seller: product.seller._id,
        totalAmount: totalAmount,
        platformFee: platformFee,
        sellerPayout: sellerPayout,
        requiresAuthentication: requiresAuthentication,
        authenticationFee: currentAuthFee,
        authenticationStatus: requiresAuthentication ? 'pending' : 'not_required',
        status: 'pending'
    };

    // 6. Opret ordren i databasen
    const order = await orderRepo.createOrder(orderData);

// 7. Opret Stripe PaymentIntent (ESCROW + CONNECT + PLATFORM FEE)
    const paymentIntent = await stripe.paymentIntents.create({
        amount: totalAmount * 100, // i øre
        currency: 'dkk',
        capture_method: 'manual', // ⭐ ESCROW – vi capturer først efter 72 timer
        application_fee_amount: platformFee * 100, // ⭐ Gilberts fee
        transfer_data: {
            destination: product.seller.stripeAccountId // ⭐ Sælgers Connect-konto
        },
        metadata: {
            orderId: order._id.toString(),
            productId: productId.toString(),
            buyerId: buyerId.toString(),
            sellerId: product.seller._id.toString()
        }
    });

// 8. Gem PaymentIntent ID på ordren
    await orderRepo.updateOrderSession(order._id, paymentIntent.id);

// 9. Returnér client_secret til frontend (Stripe.js)
    return {
        order,
        clientSecret: paymentIntent.client_secret
    };
}

async function getUserOrders(userId) {
    // Her kan vi tilføje logik senere, f.eks. hvis vi vil
    // beregne om reklamationsfristen er aktiv for hver ordre

    const orders = await orderRepo.getOrdersByBuyer(userId);
    return orders.map(order => {
        // Vi kan tilføje en virtuel property her, som frontenden kan bruge
        const orderObj = order.toObject();

        if (order.deliveredAt) {
            const now = new Date();
            orderObj.isReclamable = now <= order.payoutEligibleAt;
        }

        return orderObj;
    });

}

async function processEligiblePayouts() {
    const now = new Date();
    const eligibleOrders = await orderRepo.findOrdersReadyForPayout(now);

    for (const order of eligibleOrders) {
        try {
            console.log(`🤖 Cron: Capturing PaymentIntent for order ${order._id}`);

            // ⭐ Capture PaymentIntent → Stripe udbetaler automatisk til sælger
            const capture = await stripe.paymentIntents.capture(order.stripePaymentIntentId);

            // ⭐ Opdater ordren som udbetalt
            await orderRepo.updateOrderAsPaidOut(order._id, capture.id);

            console.log(`✅ PaymentIntent captured og udbetalt for ordre: ${order._id}`);
        } catch (error) {
            console.error(`❌ Fejl ved capture for ordre ${order._id}:`, error.message);
        }
    }
}


async function openOrderDispute(orderId, userId) {
    // 1. Find ordren
    const order = await orderRepo.findOrderById(orderId);

    if (!order) {
        throw new Error("Ordren blev ikke fundet.");
    }

    // 2. Sikkerhedstjek: Er det køberen, der forsøger at lave indsigelsen?
    if (order.buyer._id.toString() !== userId.toString()) {
        throw new Error("Du har ikke tilladelse til at lave indsigelse på denne ordre.");
    }

    // 3. Status-tjek: Kan man overhovedet lave indsigelse?
    // Man kan kun lave indsigelse, hvis varen er markeret som 'delivered'
    // og endnu ikke er 'completed' eller 'paid_out'.
    if (order.status !== 'delivered') {
        throw new Error("Du kan kun lave en indsigelse efter varen er markeret som leveret.");
    }

    // 4. Tids-tjek: Er de 72 timer udløbet?
    if (new Date() > order.payoutEligibleAt) {
        throw new Error("Fristen på 72 timer for indsigelse er udløbet.");
    }

    // 5. Udfør opdateringen via repo
    return await orderRepo.disputeOrder(orderId);
}

async function handlePaymentIntentSucceeded(intent) {
    const orderId = intent.metadata.orderId;
    if (!orderId) throw new Error("Missing orderId in PaymentIntent metadata");

    // Stripe sender shipping info via separate events, så vi bruger billing_details her
    const shippingAddress = {
        name: intent.shipping?.name || intent.billing_details?.name || "Ukendt",
        street: intent.shipping?.address?.line1 || null,
        city: intent.shipping?.address?.city || null,
        zip: intent.shipping?.address?.postal_code || null,
        country: intent.shipping?.address?.country || "DK"
    };

    // 1. Opdater ordren til 'paid'
    const updatedOrder = await orderRepo.updateOrderStatusWithAddress(orderId, {
        status: 'paid',
        shippingAddress: shippingAddress,
        stripePaymentIntentId: intent.id
    });

    // 2. Opret fragtlabel hos Shipmondo
    try {
        console.log(`Beder Shipmondo om label til ordre: ${orderId}`);
        await shippingService.createShipmondoLabel(orderId);
        console.log(`✅ Shipmondo label oprettet og gemt på ordren.`);
    } catch (shippingError) {
        console.error(`❌ Shipmondo fejl for ordre ${orderId}:`, shippingError.message);

        await orderRepo.updateOrderShipping(orderId, {
            trackingNumber: 'ERROR',
            labelUrl: null,
            externalId: `FEJL: ${shippingError.message}`
        });

        try {
            await mailer.send({
                to: process.env.ADMIN_EMAIL,
                subject: `⚠️ Shipmondo fejl (Ordre: ${orderId})`,
                html: `
                    <h2>Fragtlabel kunne ikke oprettes</h2>
                    <p>Ordre: <strong>${orderId}</strong></p>
                    <p>Fejl: ${shippingError.message}</p>
                `
            });
        } catch (mailErr) {
            console.error("Kunne ikke sende fejl-mail til admin:", mailErr.message);
        }
    }

    return updatedOrder;
}


module.exports = {
    initiateOrder,
    getUserOrders,
    processEligiblePayouts,
    openOrderDispute,
    handlePaymentIntentSucceeded,
};