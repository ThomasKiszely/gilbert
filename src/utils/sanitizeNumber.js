function sanitizeNumber(value) {
    if (value === undefined || value === null) {
        return null;
    }

    // Konverter til string og trim whitespace
    const cleaned = String(value).trim();

    // Fjern HTML-tags (simpel sanitization)
    const noTags = cleaned.replace(/<[^>]*>?/gm, '');

    // Konverter til tal
    const num = Number(noTags);

    // Returnér null hvis det ikke er et gyldigt tal
    return Number.isFinite(num) ? num : null;
}

module.exports = sanitizeNumber;
