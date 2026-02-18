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

function sanitizeHtmlContent(html) {
    if (!html) return "";

    // Fjern script-tags
    html = html.replace(/<script.*?>.*?<\/script>/gi, "");

    // Fjern event handlers (onclick, onload, osv.)
    html = html.replace(/ on\w+="[^"]*"/gi, "");

    // Fjern javascript: i links
    html = html.replace(/javascript:/gi, "");

    // Tillad kun disse tags
    const allowedTags = [
        "p", "br", "strong", "em", "b", "i",
        "h1", "h2", "h3", "ul", "ol", "li",
        "img", "a", "pre", "code"
    ];

    // Fjern alle tags der ikke er i whitelist
    return html.replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (match, tag) => {
        return allowedTags.includes(tag.toLowerCase()) ? match : "";
    });
}


module.exports = {
    sanitizeString,
    sanitizeEmail,
    sanitizeChatMessage,
    sanitizeHtmlContent
}