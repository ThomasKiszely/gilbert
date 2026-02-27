require('dotenv').config();
const app = require('./src/app');
const PORT = process.env.PORT || 3000;
const host = process.env.HOST || 'localhost'
const startPayoutCron = require('./src/utils/cron');

startPayoutCron();

app.listen(PORT, () => {
  console.log(`Skynet lytter på http://${host}:${PORT}`);
});