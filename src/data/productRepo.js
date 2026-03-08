const Product = require("../models/Product");
const Gender = require("../models/Gender");
const {Types} = require("mongoose");
const POPULATE_FIELDS = 'category subcategory brand gender size condition color material tags seller';

async function createProduct(productData) {
    const newProduct = new Product(productData);
    return await newProduct.save();
}


// Til forsiden
async function allProducts(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return await Product.find({status: 'Approved'}).skip(skip).limit(limit)
        .populate(POPULATE_FIELDS).lean();
}

async function getProductById(productId) {
    return await Product.findOne({_id: productId, status: 'Approved'}).populate(POPULATE_FIELDS).lean();
}

// Admin-preview helper: fetch a product by id regardless of status
async function getProductByIdAny(productId) {
    return await Product.findById(productId).populate(POPULATE_FIELDS).lean();
}
// Til specfik side fx. Mænd -> Clothing -> T-Shirt
async function findProducts(filters, page = 1, limit = 20) {
    const query = { status: "Approved" };

    if (filters.categoryId) {
        query.category = new Types.ObjectId(filters.categoryId);
    }

    if (filters.subcategory) {
        query.subcategory = new Types.ObjectId(filters.subcategory);
    }

    if (filters.typeId) {
        query.tags = new Types.ObjectId(filters.typeId);
    }

    // Enkelt brandId (legacy) eller array af brands
    if (filters.brands && filters.brands.length > 0) {
        query.brand = { $in: filters.brands.map(id => new Types.ObjectId(id)) };
    } else if (filters.brandId) {
        query.brand = new Types.ObjectId(filters.brandId);
    }

    if (filters.gender) {
        // Frontend sends name (e.g. "Male"), resolve to ObjectId
        // Also include "Unisex" products when filtering by Male or Female
        if (Types.ObjectId.isValid(filters.gender)) {
            const unisexDoc = await Gender.findOne({ name: "Unisex" });
            const ids = [new Types.ObjectId(filters.gender)];
            if (unisexDoc) ids.push(unisexDoc._id);
            query.gender = { $in: ids };
        } else {
            const [genderDoc, unisexDoc] = await Promise.all([
                Gender.findOne({ name: filters.gender }),
                Gender.findOne({ name: "Unisex" }),
            ]);
            const ids = [];
            if (genderDoc) ids.push(genderDoc._id);
            if (unisexDoc && filters.gender !== "Unisex") ids.push(unisexDoc._id);
            if (ids.length > 0) query.gender = { $in: ids };
        }
    }

    if (filters.conditions && filters.conditions.length > 0) {
        query.condition = { $in: filters.conditions.map(id => new Types.ObjectId(id)) };
    }

    if (filters.sizes && filters.sizes.length > 0) {
        query.size = { $in: filters.sizes.map(id => new Types.ObjectId(id)) };
    }

    if (filters.colors && filters.colors.length > 0) {
        query.color = { $in: filters.colors.map(id => new Types.ObjectId(id)) };
    }

    if (filters.materials && filters.materials.length > 0) {
        query.material = { $in: filters.materials.map(id => new Types.ObjectId(id)) };
    }

    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
        query.price = {};
        if (filters.priceMin !== undefined) query.price.$gte = Number(filters.priceMin);
        if (filters.priceMax !== undefined) query.price.$lte = Number(filters.priceMax);
    }

    // Sortering
    let sortObj = { createdAt: -1 }; // default: nyeste først
    if (filters.sort === "price_asc") sortObj = { price: 1 };
    else if (filters.sort === "price_desc") sortObj = { price: -1 };
    else if (filters.sort === "newest") sortObj = { createdAt: -1 };

    const skip = (page - 1) * limit;


    return await Product.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .populate(POPULATE_FIELDS)
        .lean();
}


async function adminGetAllProducts(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return await Product.find({})
        .skip(skip)
        .limit(limit)
        .populate(POPULATE_FIELDS)
        .lean();
}

async function getProductsInReview() {
    return await Product.find({ status: 'In Review'}).populate(POPULATE_FIELDS).lean();
}

async function updateProduct(productId, productData) {
    const updatedProduct = await Product.findByIdAndUpdate( productId, productData, { new: true, runValidators: true } )
        .populate(POPULATE_FIELDS);
    return updatedProduct;
}

async function updateStatusProduct(productId, status) {
    return await Product.findByIdAndUpdate(
        productId,
        {status},
        {new: true, runValidators: true}
    );
}

async function deleteProduct(productId) {
    const deltedProduct = await Product.findByIdAndDelete(productId);
    return deltedProduct;
}



async function searchProducts(filters, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const pipeline = [
        // Join brand
        {
            $lookup: {
                from: 'brands',
                localField: 'brand',
                foreignField: '_id',
                as: 'brand',
            }
        },
        { $unwind: '$brand' },

        // Join category
        {
            $lookup: {
                from: 'subcategories',
                localField: 'subcategory',
                foreignField: '_id',
                as: 'subcategory'
            }
        },
        { $unwind: '$subcategory' },

        // Join tags
        {
            $lookup: {
                from: 'tags',
                localField: 'tags',
                foreignField: '_id',
                as: 'tags',
            }
        },
        // Join gender
        {
            $lookup: {
                from: 'genders',
                localField: 'gender',
                foreignField: '_id',
                as: 'gender',
            }
        },
        { $unwind: { path: '$gender', preserveNullAndEmptyArrays: true } },
        {$match: { status: 'Approved' }},

        ...(filters.$or ? [{$match: { $or: filters.$or } }] : []),

        // Pagination
        {$skip: skip},
        {$limit: limit}
    ];

    return await Product.aggregate(pipeline);
}

async function findProductsBySeller(sellerId, includeAll = false) {
    const filter = {seller: sellerId};
    if(!includeAll) {
        filter.status = 'Approved';
    }
    return await Product.find(filter)
        .populate("category")
        .populate("subcategory")
        .populate("brand")
        .populate("gender")
        .populate("size")
        .populate("condition")
        .populate("color")
        .populate("material")
        .populate("tags");
}

async function updateManyProductsStatus(sellerId, newStatus) {
    return await Product.updateMany(
        { seller: sellerId },
        { $set: { status: newStatus } }
    );
}

// Trending = products with the most favorites
async function getTrendingProducts(limit = 8) {
    const Favorite = require('../models/Favorite');

    const trending = await Favorite.aggregate([
        // Group by product and count favorites
        { $group: { _id: "$product", favoriteCount: { $sum: 1 } } },
        { $sort: { favoriteCount: -1 } },
        { $limit: limit * 2 }, // get extra in case some aren't approved
    ]);

    const productIds = trending.map(t => t._id);

    const products = await Product.find({
        _id: { $in: productIds },
        status: 'Approved'
    })
        .populate(POPULATE_FIELDS)
        .lean();

    // Re-sort by favorite count
    const countMap = new Map(trending.map(t => [t._id.toString(), t.favoriteCount]));
    products.sort((a, b) => (countMap.get(b._id.toString()) || 0) - (countMap.get(a._id.toString()) || 0));

    return products.slice(0, limit);
}

// Editor's Picks = random selection of approved products (refreshes each request)
async function getEditorsPicks(limit = 3) {
    return await Product.aggregate([
        { $match: { status: 'Approved' } },
        { $sample: { size: limit } },
        {
            $lookup: { from: 'brands', localField: 'brand', foreignField: '_id', as: 'brand' }
        },
        { $unwind: { path: '$brand', preserveNullAndEmptyArrays: true } },
        {
            $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'category' }
        },
        { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
        {
            $lookup: { from: 'subcategories', localField: 'subcategory', foreignField: '_id', as: 'subcategory' }
        },
        { $unwind: { path: '$subcategory', preserveNullAndEmptyArrays: true } },
        {
            $lookup: { from: 'sizes', localField: 'size', foreignField: '_id', as: 'size' }
        },
        { $unwind: { path: '$size', preserveNullAndEmptyArrays: true } },
        {
            $lookup: { from: 'conditions', localField: 'condition', foreignField: '_id', as: 'condition' }
        },
        { $unwind: { path: '$condition', preserveNullAndEmptyArrays: true } },
        {
            $lookup: { from: 'colors', localField: 'color', foreignField: '_id', as: 'color' }
        },
        { $unwind: { path: '$color', preserveNullAndEmptyArrays: true } },
        {
            $lookup: { from: 'materials', localField: 'material', foreignField: '_id', as: 'material' }
        },
        { $unwind: { path: '$material', preserveNullAndEmptyArrays: true } },
        {
            $lookup: { from: 'tags', localField: 'tags', foreignField: '_id', as: 'tags' }
        },
        {
            $lookup: { from: 'genders', localField: 'gender', foreignField: '_id', as: 'gender' }
        },
        { $unwind: { path: '$gender', preserveNullAndEmptyArrays: true } },
        {
            $lookup: { from: 'users', localField: 'seller', foreignField: '_id', as: 'seller' }
        },
        { $unwind: { path: '$seller', preserveNullAndEmptyArrays: true } },
    ]);
}


module.exports = {
    createProduct,
    allProducts,
    getProductById,
    findProducts,
    updateProduct,
    updateStatusProduct,
    adminGetAllProducts,
    getProductsInReview,
    deleteProduct,
    searchProducts,
    findProductsBySeller,
    updateManyProductsStatus,
    getTrendingProducts,
    getEditorsPicks,
    getProductByIdAny,
}