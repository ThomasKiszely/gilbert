require('dotenv').config();

function isProduction() {
    if (process.env.NODE_ENV === 'production') {
        return true;
    }
    return false;
}

module.exports = {
    isProduction
};