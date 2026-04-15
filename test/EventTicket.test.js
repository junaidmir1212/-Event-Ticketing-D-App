// test/EventTicket.test.js

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EventTicket Contract", function () {

  let eventTicket;
  let owner;
  let buyer;

  // Har test se pehle fresh contract deploy karo
  beforeEach(async function () {
    [owner, buyer] = await ethers.getSigners();
    const EventTicket = await ethers.getContractFactory("EventTicket");
    eventTicket = await EventTicket.deploy();
  });

  // TEST 1: Event banana
  it("Should create an event", async function () {
    const futureDate = Math.floor(Date.now() / 1000) + 86400; // kal ki date
    const price = ethers.parseEther("0.01");

    await eventTicket.createEvent(
      "Lahore Music Fest",
      "Lahore Expo Centre",
      futureDate,
      price,
      100
    );

    const event = await eventTicket.events(0);
    expect(event.name).to.equal("Lahore Music Fest");
    expect(event.totalTickets).to.equal(100);
    expect(event.isActive).to.equal(true);
  });

  // TEST 2: Ticket khareedna
  it("Should buy a ticket and mint NFT", async function () {
    const futureDate = Math.floor(Date.now() / 1000) + 86400;
    const price = ethers.parseEther("0.01");

    await eventTicket.createEvent("Test Event", "Karachi", futureDate, price, 50);

    await eventTicket.connect(buyer).buyTicket(0, { value: price });

    // Buyer ke pass NFT hona chahiye
    const balance = await eventTicket.balanceOf(buyer.address);
    expect(balance).to.equal(1);

    // Ticket valid honi chahiye
    const isValid = await eventTicket.isTicketValid(0);
    expect(isValid).to.equal(true);
  });

  // TEST 3: Ticket use karna
  it("Should mark ticket as used", async function () {
    const futureDate = Math.floor(Date.now() / 1000) + 86400;
    const price = ethers.parseEther("0.01");

    await eventTicket.createEvent("Test Event", "Islamabad", futureDate, price, 50);
    await eventTicket.connect(buyer).buyTicket(0, { value: price });
    await eventTicket.connect(buyer).useTicket(0);

    const isValid = await eventTicket.isTicketValid(0);
    expect(isValid).to.equal(false); // Used ho gai
  });

  // TEST 4: Sold out check
  it("Should reject purchase when sold out", async function () {
    const futureDate = Math.floor(Date.now() / 1000) + 86400;
    const price = ethers.parseEther("0.01");

    // Sirf 1 ticket wala event
    await eventTicket.createEvent("Small Event", "Multan", futureDate, price, 1);
    await eventTicket.connect(buyer).buyTicket(0, { value: price });

    // Doosri baar fail honi chahiye
    await expect(
      eventTicket.connect(buyer).buyTicket(0, { value: price })
    ).to.be.revertedWith("Event is sold out");
  });
});