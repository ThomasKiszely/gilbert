function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/æ/g, "ae")
        .replace(/ø/g, "oe")
        .replace(/å/g, "aa")
        .replace(/[^a-z0-9 -]/g, "")   // fjern specialtegn
        .replace(/\s+/g, "-")          // mellemrum → -
        .replace(/-+/g, "-");          // fjern dobbelt --
}

module.exports = {
    slugify
};
