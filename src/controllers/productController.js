const productService = require('../services/productService');
const {saveProductImage} = require('../services/imageService');
async function createProduct(req, res, next) {
    try {
        const imageFiles = req.files || [];

        const images = [];

        for(const file of imageFiles) {
            const url = await saveProductImage(file);
            images.push(url);
        }
        const productData = {
            ...req.body,
            weight: req.body.weight ? parseInt(req.body.weight) : 1000,
            images,
            seller: req.user.id
        }
        console.log("PRODUCT DATA:", productData);
        const product = await productService.createProduct(productData);
        if (!product) {
            const err = new Error('Product not created');
            err.status = 400;
            return next(err);
        }
        return res.status(201).json(product);
    } catch (error) {
        if (error.requiresStripe) {
            return res.status(403).json({
                success: false,
                requiresStripe: true,
                error: error.message
            });
        }

        next(error);
    }
}

async function readAllProducts(req, res, next) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const userId = req.user?.id;
        const products = await productService.readAllProducts(page, limit, userId);

        if (!products) {
            const err = new Error('Products not found');
            err.status = 400;
            return next(err);
        }

        return res.status(200).json(products);
    } catch (error) {
        next(error);
    }
}

async function getProductById(req, res, next) {
    try {
        const userId = req.user?.id;
        const product = await productService.getProductById(req.params.id, userId);

        if (!product) {
            const err = new Error('Product not found with valid id');
            err.status = 400;
            return next(err);
        }
        return res.status(200).json(product);
    } catch (error) {
        next(error);
    }
}
async function updateProduct(req, res, next) {
    try {
        const id = req.params.id;
        const product = req.body;
        const updatedProduct = await productService.updateProduct(id, product);
        if (!updatedProduct) {
            const err = new Error('Product could not be updated');
            err.status = 400;
            return next(err);
        }
        return res.status(200).json(updatedProduct);
    } catch (error) {
        next(error);
    }
}
async function deleteProduct(req, res, next) {
    try {
        const id = req.params.id;
        const deletedProduct = await productService.deleteProduct(id);
        if (!deletedProduct) {
            const err = new Error('Product could not be deleted');
            err.status = 400;
            return next(err);
        }
        return res.status(200).json(deletedProduct);
    } catch (error) {
        next(error);
    }
}

async function filterProducts(req, res, next) {
    try {
        const {
            categoryId,
            subcategory,
            typeId,
            brandId,
            gender,
            priceMin,
            priceMax,
            sort,
            page = 1,
            limit = 20
        } = req.query;

        // Støtter både ?brands=id1&brands=id2 og ?brands=id1,id2
        const parseArray = (val) => {
            if (!val) return [];
            if (Array.isArray(val)) return val.filter(Boolean);
            return val.split(",").filter(Boolean);
        };

        const filters = {
            categoryId,
            subcategory,
            typeId,
            brandId,
            gender,
            brands:    parseArray(req.query.brands),
            conditions: parseArray(req.query.conditions),
            sizes:     parseArray(req.query.sizes),
            colors:    parseArray(req.query.colors),
            materials: parseArray(req.query.materials),
            priceMin:  priceMin !== undefined ? Number(priceMin) : undefined,
            priceMax:  priceMax !== undefined ? Number(priceMax) : undefined,
            sort,
        };

        const userId = req.user?.id;
        const products = await productService.findProducts(filters, page, limit, userId);


        return res.status(200).json(products);
    } catch (error) {
        next(error);
    }
}






async function getProductsBySeller(req, res, next) {
    try {
        const sellerId = req.params.id;
        const includeAll = req.query.all === "true";
        const products = await productService.findProductsBySeller(sellerId, includeAll);

        return res.status(200).json({
            success: true,
            data: products
        });
    } catch (error) {
        next(error);
    }
}

async function getTrendingProducts(req, res, next) {
    try {
        const limit = parseInt(req.query.limit) || 8;
        const userId = req.user?.id;
        const products = await productService.getTrendingProducts(limit, userId);
        return res.status(200).json(products);
    } catch (error) {
        next(error);
    }
}

async function getEditorsPicks(req, res, next) {
    try {
        const limit = parseInt(req.query.limit) || 3;
        const userId = req.user?.id;
        const products = await productService.getEditorsPicks(limit, userId);
        return res.status(200).json(products);
    } catch (error) {
        next(error);
    }
}


module.exports = {
    createProduct,
    readAllProducts,
    filterProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getProductsBySeller,
    getTrendingProducts,
    getEditorsPicks,
}