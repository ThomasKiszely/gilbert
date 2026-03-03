const cron = require('node-cron');
const orderService = require('../services/orderService');
const bidService = require('../services/bidService');

// Vi opsætter en opgave, der kører f.eks. hver time
// Formatet '* * * * *' betyder: Minut, Time, Dag, Måned, Ugedag
const startCronJobs = () => {
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
    // 🟩 2) Udløbne bud — hvert 10. minut
    cron.schedule("*/10 * * * *", async () => {
        console.log("🤖 Cron: Tjekker for udløbne bud...");
        try { await bidService.expireOldBids();
            console.log("✅ Cron: Udløbne bud behandlet.");
        } catch (error) {
            console.error("❌ Cron: Fejl under bud-udløb:", error);
        }
    });
    // Slet gamle bud én gang om dagen kl. 03:00
    cron.schedule("0 3 * * *", async () => {
        console.log("🤖 Cron: Sletter gamle bud...");
        try {
            await bidService.deleteOldBids();
            console.log("🗑️ Cron: Gamle bud slettet.");
        } catch (error) {
            console.error("❌ Cron: Fejl ved sletning af gamle bud:", error);
        }
    });

};

module.exports = startCronJobs;