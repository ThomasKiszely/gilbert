function sanitizeString(str) {
    return str
        .trim()
        .replace(/<[^>]*>?/gm, "") //Fjerner HTML‑tags og script‑tags
        .replace(/\s+/g, " ") //.replace(/\s+/g, " ")
        .replace(/[^\w\s\-ÆØÅæøå]/g, ""); //Fjerner alle tegn der ikke er tilladt
}
module.exports = {
    sanitizeString,
}