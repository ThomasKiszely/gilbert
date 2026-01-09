const express = require('express');
const app = express();
const path = require('path');
const viewRouter = require('./routes/viewRoutes');
const { notFound } = require('./middlewares/notFound');
const { errorHandler } = require('./middlewares/errorHandler');
const { connectToMongo } = require('./services/db');
connectToMongo();
//npx nodemon server eller npm run dev for at starte nodemon - ctrl-c for at afslutte

// Middleware
app.use(express.json());

app.use(express.static(path.join(__dirname, '..', 'public')));

// Routes
app.use('/', router);

app.use(notFound);
app.use(errorHandler);

module.exports = app;