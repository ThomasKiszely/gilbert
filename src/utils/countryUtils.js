const countries = require("i18n-iso-countries");
countries.registerLocale(require("i18n-iso-countries/langs/en.json"));
countries.registerLocale(require("i18n-iso-countries/langs/da.json"));

function toCountryCode(country) {
    if (!country) return "DK";
    const code =
        countries.getAlpha2Code(country, "en") ||
        countries.getAlpha2Code(country, "da");
    return code || "DK";
}

module.exports = { toCountryCode };

