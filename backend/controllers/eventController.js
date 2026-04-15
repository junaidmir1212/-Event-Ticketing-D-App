const { getReadContract, getWriteContract } = require("../utils/contract");
const { ethers } = require("ethers");

const getAllEvents = async (req, res) => {
  try {
    const contract = getReadContract();
    if (!contract) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }
    const totalEvents = await contract.getTotalEvents();
    const events = [];
    for (let i = 0; i < Number(totalEvents); i++) {
      const e = await contract.events(i);
      events.push({
        id: i,
        name: e[0],
        venue: e[1],
        date: Number(e[2]),
        price: ethers.formatEther(e[3]),
        priceWei: e[3].toString(),
        totalTickets: Number(e[4]),
        ticketsSold: Number(e[5]),
        isActive: e[6],
        availableTickets: Number(e[4]) - Number(e[5]),
      });
    }
    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch events from blockchain", error: error.message });
  }
};

const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const contract = getReadContract();
    if (!contract) return res.status(404).json({ success: false, message: "Contract not configured" });
    const e = await contract.events(id);
    res.status(200).json({
      success: true,
      data: {
        id: Number(id),
        name: e[0],
        venue: e[1],
        date: Number(e[2]),
        price: ethers.formatEther(e[3]),
        totalTickets: Number(e[4]),
        ticketsSold: Number(e[5]),
        isActive: e[6],
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch event", error: error.message });
  }
};

const createEvent = async (req, res) => {
  try {
    const { name, venue, date, price, totalTickets } = req.body;
    if (!name || !venue || !date || !price || !totalTickets) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    const contract = getWriteContract();
    const priceInWei = ethers.parseEther(price.toString());
    const dateTimestamp = Math.floor(new Date(date).getTime() / 1000);
    const tx = await contract.createEvent(name, venue, dateTimestamp, priceInWei, totalTickets);
    await tx.wait();
    res.status(201).json({ success: true, message: "Event created successfully", transactionHash: tx.hash });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create event", error: error.message });
  }
};

module.exports = { getAllEvents, getEventById, createEvent };