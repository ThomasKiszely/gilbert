const Condition = require('../models/Condition');

async function createCondition(conditionData) {
    const condition = new Condition(conditionData);
    return await condition.save();
}

async function readAllConditions() {
    return await Condition.find({});
}

module.exports = {
    createCondition,
    readAllConditions,
}