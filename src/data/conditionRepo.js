const Condition = require('../models/Condition');

async function createCondition(conditionData) {
    const condition = new Condition(conditionData);
    return await condition.save();
}

module.exports = {
    createCondition,
}