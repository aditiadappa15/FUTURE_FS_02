const express = require("express");
const { ObjectId } = require("mongodb");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

// Get all leads
router.get("/", async (req, res) => {
    try {
        const leads = req.app.locals.db.collection("leads");

        const result = await leads
            .find()
            .sort({ createdAt: -1 })
            .toArray();

        res.json(result);

    } catch (error) {
        console.error("Get leads error:", error);

        res.status(500).json({
            message: "Failed to get leads"
        });
    }
});


// Get one lead
router.get("/:id", async (req, res) => {
    try {
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid lead ID"
            });
        }

        const leads = req.app.locals.db.collection("leads");

        const lead = await leads.findOne({
            _id: new ObjectId(req.params.id)
        });

        if (!lead) {
            return res.status(404).json({
                message: "Lead not found"
            });
        }

        res.json(lead);

    } catch (error) {
        console.error("Get lead error:", error);

        res.status(500).json({
            message: "Failed to get lead"
        });
    }
});


// Add lead
router.post("/", async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            company,
            source,
            message,
            status
        } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                message: "Name and email are required"
            });
        }

        const leads = req.app.locals.db.collection("leads");

        const newLead = {
            name,
            email,
            phone: phone || "",
            company: company || "",
            source: source || "Other",
            message: message || "",
            status: status || "New",
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await leads.insertOne(newLead);

        res.status(201).json({
            message: "Lead added successfully",
            leadId: result.insertedId
        });

    } catch (error) {
        console.error("Add lead error:", error);

        res.status(500).json({
            message: "Failed to add lead"
        });
    }
});


// Update lead
router.put("/:id", async (req, res) => {
    try {
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid lead ID"
            });
        }

        const leads = req.app.locals.db.collection("leads");

        const updateData = {};

        if (req.body.name !== undefined) {
            updateData.name = req.body.name;
        }

        if (req.body.email !== undefined) {
            updateData.email = req.body.email;
        }

        if (req.body.phone !== undefined) {
            updateData.phone = req.body.phone;
        }

        if (req.body.company !== undefined) {
            updateData.company = req.body.company;
        }

        if (req.body.source !== undefined) {
            updateData.source = req.body.source;
        }

        if (req.body.message !== undefined) {
            updateData.message = req.body.message;
        }

        if (req.body.status !== undefined) {
            updateData.status = req.body.status;
        }

        updateData.updatedAt = new Date();

        const result = await leads.updateOne(
            {
                _id: new ObjectId(req.params.id)
            },
            {
                $set: updateData
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                message: "Lead not found"
            });
        }

        res.json({
            message: "Lead updated successfully"
        });

    } catch (error) {
        console.error("Update lead error:", error);

        res.status(500).json({
            message: "Failed to update lead"
        });
    }
});


// Delete lead
router.delete("/:id", async (req, res) => {
    try {
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid lead ID"
            });
        }

        const leads = req.app.locals.db.collection("leads");

        const result = await leads.deleteOne({
            _id: new ObjectId(req.params.id)
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                message: "Lead not found"
            });
        }

        res.json({
            message: "Lead deleted successfully"
        });

    } catch (error) {
        console.error("Delete lead error:", error);

        res.status(500).json({
            message: "Failed to delete lead"
        });
    }
});


// Add follow-up note
router.post("/:id/notes", async (req, res) => {
    try {
        const leadId = req.params.id;
        const { note } = req.body;

        if (!ObjectId.isValid(leadId)) {
            return res.status(400).json({
                message: "Invalid lead ID"
            });
        }

        if (!note || !note.trim()) {
            return res.status(400).json({
                message: "Note is required"
            });
        }

        const db = req.app.locals.db;

        const leads = db.collection("leads");
        const notes = db.collection("notes");

        const lead = await leads.findOne({
            _id: new ObjectId(leadId)
        });

        if (!lead) {
            return res.status(404).json({
                message: "Lead not found"
            });
        }

        const newNote = {
            leadId: new ObjectId(leadId),
            note: note.trim(),
            createdAt: new Date()
        };

        await notes.insertOne(newNote);

        res.status(201).json({
            message: "Note added successfully"
        });

    } catch (error) {
        console.error("Add note error:", error);

        res.status(500).json({
            message: "Failed to add note"
        });
    }
});


// Get follow-up notes
router.get("/:id/notes", async (req, res) => {
    try {
        const leadId = req.params.id;

        if (!ObjectId.isValid(leadId)) {
            return res.status(400).json({
                message: "Invalid lead ID"
            });
        }

        const notes = req.app.locals.db.collection("notes");

        const result = await notes
            .find({
                leadId: new ObjectId(leadId)
            })
            .sort({ createdAt: -1 })
            .toArray();

        res.json(result);

    } catch (error) {
        console.error("Get notes error:", error);

        res.status(500).json({
            message: "Failed to get notes"
        });
    }
});


module.exports = router;