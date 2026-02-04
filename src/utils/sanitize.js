function sanitizeString(str) {
    return str
        .trim()
        .replace(/<[^>]*>?/gm, "") //Fjerner HTML‑tags og script‑tags
        .replace(/\s+/g, " ") //.replace(/\s+/g, " ")
        .replace(/[^\w\s\-ÆØÅæøå]/g, ""); //Fjerner alle tegn der ikke er tilladt
}
function sanitizeEmail(str) {
    return str
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ""); // fjerner kun whitespace
}

module.exports = {
    sanitizeString,
    sanitizeEmail
}