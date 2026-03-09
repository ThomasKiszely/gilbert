const express = require('express');
const app = express();
const path = require('path');
//const viewRouter = require('./routes/viewRoutes');
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');

// Product routers
const productRouter = require('./routes/productRoutes');
const brandRouter = require('./routes/brandRoutes');
const categoryRouter = require('./routes/categoryRoutes');
const colorRouter = require('./routes/colorRoutes');
const conditionRouter = require('./routes/conditionRoutes');
const materialRouter = require('./routes/materialRoutes');
const sizeRouter = require('./routes/sizeRoutes');
const subcategoryRouter = require('./routes/subcategoryRoutes');
const tagRouter = require('./routes/tagRoutes');
const genderRouter = require('./routes/genderRoutes');
const adminRouter = require('./routes/adminRoutes');
const favoriteRouter = require('./routes/favoriteRoutes');
const bidRouter = require('./routes/bidRoutes');
const searchRouter = require('./routes/searchRoutes');
const notificationRouter = require('./routes/notificationRoutes');
const chatRouter = require('./routes/chatRoutes');
const blogRouter = require('./routes/blogRoutes');
const followRouter = require('./routes/followRoutes');
const reportRouter = require('./routes/reportRoutes');
const orderRouter = require('./routes/orderRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const authenticationRouter = require('./routes/authenticationRoutes');
const stripeRouter = require('./routes/stripeRoutes');
const checkoutRouter = require('./routes/checkoutRoutes');
const discountCodeRoutes = require('./routes/discountCodeRoutes');
const webhookRouter = require('./routes/webhookRoutes');
const cookieParser = require('cookie-parser') ;
const { limitRate } = require('./middlewares/rateLimiter');
const { log } = require('./middlewares/logger');
//const { jwtAuth } = require('./middlewares/jwtAuth');
const { requireAuth } = require('./middlewares/auth');
const { requireRole } = require('./middlewares/requireRole');
const { notFound } = require('./middlewares/notFound');
const { errorHandler } = require('./middlewares/errorHandler');
const { connectToMongo } = require('./services/db');
connectToMongo();
//npx nodemon server eller npm run dev for at starte nodemon - ctrl-c for at afslutte

// Middleware
//app.set('trust proxy', 1); //hvis jeg ligger bag reverse proxy


// Webhook routes – stadig før alt andet
// I din app.js, find sektionen for webhooks og ret den til dette:
app.use('/api/webhooks/', express.raw({
    type: 'application/json',
    verify: (req, res, buf) => {
        req.rawBody = buf; // Her opretter vi req.rawBody som controlleren forventer
    }
}), webhookRouter);

// Almindelig middleware – MÅ IKKE komme før webhooks
app.use(cookieParser());
app.use(express.json());
app.use(limitRate);
app.use(log);
app.use(express.static(path.join(__dirname, '..', 'public')));


// Billede uploads
app.use("/api/images/products", express.static("uploads/products"));
app.use("/api/images/avatars", express.static("uploads/avatars"));
app.use("/api/images/blogs", express.static("uploads/blogs"));

// API routes
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/bids', bidRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/chats', chatRouter);
app.use('/api/blogs', blogRouter);
app.use('/api/reports', reportRouter);
app.use('/api/orders', orderRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/stripe', stripeRouter);
app.use('/api/checkout', checkoutRouter);
app.use('/api/favorites', favoriteRouter);
app.use('/api/discount-codes', discountCodeRoutes);
app.use('/api/admin', requireAuth, requireRole("admin"), adminRouter);
app.use('/api/authentication', requireAuth, requireRole("admin"), authenticationRouter);
app.use('/api/products', productRouter);
app.use('/api/brands', brandRouter);
app.use('/api/colors', colorRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/conditions', conditionRouter);
app.use('/api/materials', materialRouter);
app.use('/api/sizes', sizeRouter);
app.use('/api/subcategories', subcategoryRouter);
app.use('/api/tags', tagRouter);
app.use('/api/genders', genderRouter);
app.use('/api/search', searchRouter);
app.use('/api/follows', followRouter);

// 404 og error handler – ALTID sidst
app.use(notFound);
app.use(errorHandler);


module.exports = app;