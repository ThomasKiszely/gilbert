const {Types} = require("mongoose");
const Product = require("../models/Product");
const {genders} = require("../utils/gender");
const {validateEnum} = require("../utils/validate");
const {sanitizeString} = require("../utils/sanitize");
const {statuses} = require("../utils/statusType");

function validateObjectId(id)
{
    return Types.ObjectId.isValid(id);
}

async function loadProduct(req, res, next) {
    try {
        const product = await Product.findById(req.params.id);
        if (!product)
        {
            return res.status(404).json({ error: "Product not found" });
        }
        req.product = product; next();
    } catch (err)
    {
        return res.status(400).json({ error: "Invalid product ID" });
    }
}
function validateProduct(req, res, next)  {
    const errors = [];

    let {title, category, subcategory, brand, gender, size, condition, color, material, tags, price, description, images, documents, status} = req.body;

    if(typeof title === "string") {
        req.body.title = sanitizeString(title);
    }
    if (typeof description === "string")
    {
        req.body.description = sanitizeString(description);
    }

    // Gender via validateEnum
    req.body.gender = validateEnum(
        "gender",
        gender,
        genders,
        sanitizeString,
        errors
    );
    if(status !== undefined) {
        req.body.status = validateEnum(
            "status",
            status,
            statuses,
            sanitizeString,
            errors
        );
    }

    // Validate ObjectIDs
    const idFields = { category, subcategory, brand, size, condition, color, material };

    for(const [key, value] of Object.entries(idFields)) {
        if(value && !validateObjectId(value)) {
            errors.push(`${key} is not a valid ObjectID`);
        }
    }
    if(Array.isArray(tags)) {
        for(const tag of tags) {
            if(!validateObjectId(tag)) {
                errors.push(`Tag "${tag}" is not a valid ObjectID`);
            }
        }
    }
    if(errors.length > 0) {
        return res.status(400).json({ success: false, errors });
    }
    next();
}

function yourProduct(req, res, next)  {
    const errors = [];

    const user = req.user;
    const product = req.product;
    if(!product.seller.equals(user._id)) {
        errors.push('Not your product')
    }

    if(errors.length > 0) {
        return res.status(400).json({ success: false, errors });
    }
    next();
}

module.exports = {
    validateProduct,
    yourProduct,
    loadProduct,
}