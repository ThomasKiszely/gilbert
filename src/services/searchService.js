const {searchProducts} = require("./productService");
const {searchUsers} = require("./userService");

async function searchAll(query, userId) {
    if(!query || !query.trim()) {
        return {
            products: [],
            users: [],
        };
    }
    const q = query.trim();

    const filters = {
        $or: [
            { title: { $regex: q, $options: "i" } },
            { description: { $regex: q, $options: "i" } },
            { "brand.name": { $regex: q, $options: "i" } },
            { "tags.name": { $regex: q, $options: "i" } },
            { "category.name": { $regex: q, $options: "i" } },
            { "subcategory.name": { $regex: q, $options: "i" } },
        ]
    };

    const products = await searchProducts(filters, 1, 20, userId);
    const users = await searchUsers(q, userId);

    return {
        products,
        users
    };
}

module.exports = {
    searchAll
}