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
const adminRouter = require('./routes/adminRoutes');
const favoriteRouter = require('./routes/favoriteRoutes');

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
app.use(cookieParser());
app.use(express.json());
app.use(limitRate);
app.use(log);
app.use(express.static(path.join(__dirname, '..', 'public')));
//app.use("/avatars", express.static(path.join(__dirname, "..", "public", "avatars")));


// TIL UPLOAD AF BILLEDER
app.use("/api/images/products", express.static("uploads/products"));
app.use("/api/images/avatars", express.static("uploads/avatars"));


// Routes
app.use('/api/auth', authRouter);


//app.use(requireAuth);
app.use('/api/users', userRouter);

//Favorites
app.use('/api/favorites', favoriteRouter);

// Admin routes
app.use('/api/admin', requireRole("admin"), adminRouter);

// Product routes
app.use('/api/products', productRouter);
app.use('/api/brands', brandRouter);
app.use('/api/colors', colorRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/conditions', conditionRouter);
app.use('/api/materials', materialRouter);
app.use('/api/sizes', sizeRouter);
app.use('/api/subcategories', subcategoryRouter);
app.use('/api/tags', tagRouter);



//app.use('/', viewRouter);

app.use(notFound);
app.use(errorHandler);

module.exports = app;