const categoryRepo = require('../data/categoryRepo');


async function createCategory(categoryData) {
    return await categoryRepo.createCategory(categoryData);
}

async function readAllCategories() {
    return await categoryRepo.readAllCategories();
}

async function getFullCategoryTree(gender) {
    const { categories, subcategories } = await categoryRepo.getAllCategoriesWithSubcategories();

    const tree = {};

    categories.forEach(cat => {
        tree[cat.name] = [];
    });

    subcategories.forEach(sub => {
        const parent = categories.find(c => c._id.toString() === sub.category?.toString());
        if (parent) {
            tree[parent.name].push({
                id: sub._id.toString(),
                name: sub.name
            });
        }
    });

    return tree;
}

module.exports = {
    createCategory,
    readAllCategories,
    getFullCategoryTree,
}