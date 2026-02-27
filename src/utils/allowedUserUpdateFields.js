const allowedUserUpdateFields = [
    "username",
    "location.city",
    "location.country",
    "cvr",
    "profile.bio",
    "profile.avatarUrl",
    "profile.language",
    // Nye felter til fragt (Shipmondo-klar)
    "profile.address.street",
    "profile.address.houseNumber",
    "profile.address.zip",
    "profile.address.city",
    "profile.address.country"
];

module.exports = {
    allowedUserUpdateFields
};