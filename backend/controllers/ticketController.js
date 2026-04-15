// backend/controllers/ticketController.js
// Handles all ticket-related business logic

const { getReadContract } = require("../utils/contract");
const { ethers } = require("ethers");

// GET all tickets owned by a wallet address
const getUserTickets = async (req, res) => {
  try {
    const { address } = req.params;

    // Validate Ethereum address format
    if (!ethers.isAddress(address)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Ethereum wallet address",
      });
    }

    const contract = getReadContract();
    const ticketIds = await contract.getUserTickets(address);
    const tickets = [];

    for (const tokenId of ticketIds) {
      const ticket = await contract.getTicket(tokenId);
      const event = await contract.getEvent(ticket.eventId);

      tickets.push({
        tokenId: Number(tokenId),
        eventId: Number(ticket.eventId),
        eventName: event.name,
        eventVenue: event.venue,
        eventDate: Number(event.date),
        isUsed: ticket.isUsed,
        purchaseTime: Number(ticket.purchaseTime),
        originalBuyer: ticket.originalBuyer,
        isValid: !ticket.isUsed,
      });
    }

    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user tickets",
      error: error.message,
    });
  }
};

// GET NFT metadata for a specific ticket (standard NFT format)
const getTicketMetadata = async (req, res) => {
  try {
    const { tokenId } = req.params;
    const contract = getReadContract();

    const ticket = await contract.getTicket(tokenId);
    const event = await contract.getEvent(ticket.eventId);
    const owner = await contract.ownerOf(tokenId);

    // Standard ERC-721 metadata format
    const metadata = {
      name: `${event.name} — Ticket #${tokenId}`,
      description: `Official event ticket NFT for ${event.name} at ${event.venue}`,
      attributes: [
        { trait_type: "Event Name", value: event.name },
        { trait_type: "Venue", value: event.venue },
        { trait_type: "Event Date", value: new Date(Number(event.date) * 1000).toISOString() },
        { trait_type: "Status", value: ticket.isUsed ? "Used" : "Valid" },
        { trait_type: "Token ID", value: Number(tokenId) },
        { trait_type: "Current Owner", value: owner },
      ],
    };

    res.status(200).json(metadata);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch ticket metadata",
      error: error.message,
    });
  }
};

// GET single ticket details
const getTicketById = async (req, res) => {
  try {
    const { tokenId } = req.params;
    const contract = getReadContract();

    const ticket = await contract.getTicket(tokenId);
    const owner = await contract.ownerOf(tokenId);
    const isValid = await contract.isTicketValid(tokenId);

    res.status(200).json({
      success: true,
      data: {
        tokenId: Number(tokenId),
        eventId: Number(ticket.eventId),
        isUsed: ticket.isUsed,
        isValid,
        purchaseTime: Number(ticket.purchaseTime),
        originalBuyer: ticket.originalBuyer,
        currentOwner: owner,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch ticket",
      error: error.message,
    });
  }
};

module.exports = { getUserTickets, getTicketMetadata, getTicketById };