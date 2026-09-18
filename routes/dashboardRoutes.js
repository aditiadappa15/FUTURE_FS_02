const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/stats", async (req, res) => {
    try {
        const leads = req.app.locals.db.collection("leads");

        const totalLeads = await leads.countDocuments();

        const newLeads = await leads.countDocuments({
            status: "New"
        });

        const contactedLeads = await leads.countDocuments({
            status: "Contacted"
        });

        const convertedLeads = await leads.countDocuments({
            status: "Converted"
        });

        const conversionPercentage = totalLeads > 0
            ? ((convertedLeads / totalLeads) * 100).toFixed(1)
            : "0.0";

        res.json({
            totalLeads,
            newLeads,
            contactedLeads,
            convertedLeads,
            conversionPercentage
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to get dashboard statistics"
        });
    }
});

module.exports = router;