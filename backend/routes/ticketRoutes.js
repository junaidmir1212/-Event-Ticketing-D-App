// backend/routes/ticketRoutes.js

const express = require("express");
const router = express.Router();
const {
  getUserTickets,
  getTicketMetadata,
  getTicketById,
} = require("../controllers/ticketController");

router.get("/user/:address", getUserTickets);     // GET /api/tickets/user/0x123...
router.get("/metadata/:tokenId", getTicketMetadata); // GET /api/tickets/metadata/0
router.get("/:tokenId", getTicketById);           // GET /api/tickets/0

module.exports = router;