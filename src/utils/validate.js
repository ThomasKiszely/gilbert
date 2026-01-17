
function validateEnum(fieldName, value, allowedValues, sanitizeFn, errors) {
    if(typeof value === "string" && allowedValues.includes(value)) {
        return sanitizeFn(value);
    }
    errors.push(`Invalid ${fieldName}`);
    return null;
}
module.exports = {
    validateEnum,
}