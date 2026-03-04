// src/controllers/discountCodeController.js
const discountCodeRepo = require("../data/discountCodeRepo");
const validateDiscountCodeInput = require("../middlewares/validateDiscountCode");

async function listCodes(req, res, next) {
    try {
        const codes = await discountCodeRepo.listCodes();
        res.json({ success: true, codes });
    } catch (err) {
        next(err);
    }
}

async function getCode(req, res, next) {
    try {
        const { id } = req.params;
        const code = await discountCodeRepo.getById(id);
        if (!code) {
            return res.status(404).json({ success: false, message: "Code not found" });
        }
        res.json({ success: true, code });
    } catch (err) {
        next(err);
    }
}

async function createCode(req, res, next) {
    try {
        const data = req.body;

        // ⭐ Input-validering
        const errors = validateDiscountCodeInput(data);
        if (errors.length > 0) {
            return res.status(400).json({ success: false, errors });
        }

        data.createdBy = req.user.id; // admin-id

        const code = await discountCodeRepo.createCode(data);
        res.status(201).json({ success: true, code });
    } catch (err) {
        next(err);
    }
}

async function updateCode(req, res, next) {
    try {
        const { id } = req.params;
        const { active } = req.body; // Vi udtrækker KUN 'active' fra body

        // Hvis det kun er en status-opdatering (active er defineret, men intet andet)
        if (Object.keys(req.body).length === 1 && req.body.hasOwnProperty('active')) {
            const updated = await discountCodeRepo.updateCode(id, { active });
            return res.json({ success: true, code: updated });
        }

        // Hvis der er mere data (fx hvis du redigerer hele koden i en anden formular)
        // så kører vi den fulde validering som før
        const errors = validateDiscountCodeInput(req.body);
        if (errors.length > 0) {
            return res.status(400).json({ success: false, errors });
        }

        const updated = await discountCodeRepo.updateCode(id, req.body);
        res.json({ success: true, code: updated });
    } catch (err) {
        next(err);
    }
}

async function deleteCode(req, res, next) {
    try {
        const { id } = req.params;
        const deleted = await discountCodeRepo.deleteCode(id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: "Code not found" });
        }
        res.json({ success: true });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    listCodes,
    getCode,
    createCode,
    updateCode,
    deleteCode,
};
