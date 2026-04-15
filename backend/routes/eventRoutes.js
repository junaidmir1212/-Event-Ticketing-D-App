// backend/routes/eventRoutes.js

const express = require("express");
const router = express.Router();
const {
  getAllEvents,
  getEventById,
  createEvent,
} = require("../controllers/eventController");

router.get("/", getAllEvents);          // GET /api/events
router.get("/:id", getEventById);      // GET /api/events/0
router.post("/", createEvent);         // POST /api/events

module.exports = router;