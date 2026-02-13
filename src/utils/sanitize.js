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
function sanitizeChatMessage(str) {
    if (!str) return "";

    return String(str)
        .trim()
        // fjern HTML-tags
        .replace(/<[^>]*>?/gm, "")
        // fjern script-tags
        .replace(/<script.*?>.*?<\/script>/gi, "")
        // normaliser whitespace
        .replace(/\s+/g, " ");
}


module.exports = {
    sanitizeString,
    sanitizeEmail,
    sanitizeChatMessage,
}