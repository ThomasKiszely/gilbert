const cron = require('node-cron');
const orderService = require('../services/orderService');

// Vi opsætter en opgave, der kører f.eks. hver time
// Formatet '* * * * *' betyder: Minut, Time, Dag, Måned, Ugedag
const startPayoutCron = () => {
    // Denne kører én gang i timen (ved minut 0)
    cron.schedule('0 * * * *', async () => {
        console.log('🤖 Cron: Tjekker for ordrer klar til udbetaling...');
        try {
            await orderService.processEligiblePayouts();
            console.log('✅ Cron: Udbetalings-tjek gennemført.');
        } catch (error) {
            console.error('❌ Cron: Fejl under udbetalings-processen:', error);
        }
    });
};

module.exports = startPayoutCron;