// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EventTicket is ERC721, Ownable {

    // ===== DATA STRUCTURES =====

    struct Event {
        string name;
        string venue;
        uint256 date;
        uint256 price;       // in wei
        uint256 totalTickets;
        uint256 ticketsSold;
        bool isActive;
    }

    struct Ticket {
        uint256 eventId;
        bool isUsed;
        uint256 purchaseTime;
        address originalBuyer;
    }

    // ===== STATE VARIABLES =====

    uint256 private _tokenIdCounter;
    uint256 private _eventIdCounter;

    mapping(uint256 => Event) public events;
    mapping(uint256 => Ticket) public tickets;
    mapping(address => uint256[]) public userTickets;

    // ===== EVENTS (Blockchain logs) =====

    event EventCreated(
        uint256 indexed eventId,
        string name,
        uint256 price,
        uint256 totalTickets
    );

    event TicketMinted(
        uint256 indexed tokenId,
        uint256 indexed eventId,
        address indexed buyer
    );

    event TicketUsed(
        uint256 indexed tokenId,
        address usedBy
    );

    event FundsWithdrawn(
        address owner,
        uint256 amount
    );

    // ===== CONSTRUCTOR =====

    constructor() ERC721("EventTicket", "ETKT") Ownable() {}

    // ===== MAIN FUNCTIONS =====

    // 1. EVENT BANANA — sirf owner kar sakta hai
    function createEvent(
        string memory _name,
        string memory _venue,
        uint256 _date,
        uint256 _price,
        uint256 _totalTickets
    ) public onlyOwner returns (uint256) {
        require(bytes(_name).length > 0, "Event name cannot be empty");
        require(_totalTickets > 0, "Must have at least 1 ticket");
        require(_date > block.timestamp, "Event date must be in future");

        uint256 eventId = _eventIdCounter;
        _eventIdCounter++;

        events[eventId] = Event({
            name: _name,
            venue: _venue,
            date: _date,
            price: _price,
            totalTickets: _totalTickets,
            ticketsSold: 0,
            isActive: true
        });

        emit EventCreated(eventId, _name, _price, _totalTickets);
        return eventId;
    }

    // 2. TICKET KHAREEDNA — koi bhi kar sakta hai
    function buyTicket(uint256 _eventId) public payable returns (uint256) {
        Event storage evt = events[_eventId];

        require(evt.isActive, "Event is not active");
        require(evt.ticketsSold < evt.totalTickets, "Event is sold out");
        require(msg.value >= evt.price, "Insufficient ETH sent");
        require(evt.date > block.timestamp, "Event has already passed");

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        // NFT mint karo
        _safeMint(msg.sender, tokenId);

        // Ticket info store karo
        tickets[tokenId] = Ticket({
            eventId: _eventId,
            isUsed: false,
            purchaseTime: block.timestamp,
            originalBuyer: msg.sender
        });

        // User ke tickets mein add karo
        userTickets[msg.sender].push(tokenId);

        // Event mein sold count barhao
        evt.ticketsSold++;

        // Agar zyada ETH diya to wapas karo
        if (msg.value > evt.price) {
            payable(msg.sender).transfer(msg.value - evt.price);
        }

        emit TicketMinted(tokenId, _eventId, msg.sender);
        return tokenId;
    }

    // 3. TICKET USE KARNA — entry gate par
    function useTicket(uint256 _tokenId) public {
        require(ownerOf(_tokenId) == msg.sender, "You don't own this ticket");
        require(!tickets[_tokenId].isUsed, "Ticket already used");

        tickets[_tokenId].isUsed = true;
        emit TicketUsed(_tokenId, msg.sender);
    }

    // 4. EVENT BAND KARNA
    function deactivateEvent(uint256 _eventId) public onlyOwner {
        events[_eventId].isActive = false;
    }

    // 5. PAISA NIKALNA
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
        emit FundsWithdrawn(owner(), balance);
    }

    // ===== VIEW FUNCTIONS (Read only — free) =====

    function getEvent(uint256 _eventId) public view returns (Event memory) {
        return events[_eventId];
    }

    function getTicket(uint256 _tokenId) public view returns (Ticket memory) {
        return tickets[_tokenId];
    }

    function getUserTickets(address _user) public view returns (uint256[] memory) {
        return userTickets[_user];
    }

    function getTotalEvents() public view returns (uint256) {
        return _eventIdCounter;
    }

    function getTotalTickets() public view returns (uint256) {
        return _tokenIdCounter;
    }

    function isTicketValid(uint256 _tokenId) public view returns (bool) {
        return !tickets[_tokenId].isUsed;
    }
}