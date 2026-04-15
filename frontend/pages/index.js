import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { connectWallet, getContract, getProvider } from '../utils/contract';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState(null);
  const [buyingId, setBuyingId] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const provider = getProvider();
      if (!provider) { setLoading(false); return; }
      const contract = getContract(provider);
      const total = await contract.getTotalEvents();
      const loaded = [];
      for (let i = 0; i < Number(total); i++) {
        const e = await contract.events(i);
        loaded.push({
          id: i,
          name: e[0],
          venue: e[1],
          date: new Date(Number(e[2]) * 1000).toLocaleDateString(),
          price: ethers.utils.formatEther(e[3]),
          priceWei: e[3],
          totalTickets: Number(e[4]),
          ticketsSold: Number(e[5]),
          isActive: e[6],
        });
      }
      setEvents(loaded.filter(e => e.isActive));
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleConnect = async () => {
    const w = await connectWallet();
    if (w) setWallet(w);
  };

  const handleBuy = async (event) => {
    if (!wallet) {
      const w = await connectWallet();
      if (!w) return;
      setWallet(w);
    }
    try {
      setBuyingId(event.id);
      setMessage(null);
      const contract = getContract(wallet.signer);
      const tx = await contract.buyTicket(event.id, { value: event.priceWei });
      setMessage({ type: 'success', text: 'Transaction submitted — waiting for confirmation...' });
      await tx.wait();
      setMessage({ type: 'success', text: `Ticket purchased successfully! TX: ${tx.hash.slice(0, 20)}...` });
      loadEvents();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Transaction failed' });
    }
    setBuyingId(null);
  };

  return (
    <div className="container">
      <div className="hero">
        <h1>Decentralised Event Ticketing</h1>
        <p>Buy NFT tickets on Ethereum Sepolia — secure, transparent, yours forever.</p>
        {!wallet ? (
          <button className="btn btn-primary" onClick={handleConnect}>
            Connect MetaMask
          </button>
        ) : (
          <span className="wallet-info">
            Connected: {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
          </span>
        )}
      </div>

      {message && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      <h2 style={{ marginBottom: '1rem' }}>Available Events</h2>

      {loading ? (
        <div className="loading">Loading events from blockchain...</div>
      ) : events.length === 0 ? (
        <div className="loading">No events available. Check back soon!</div>
      ) : (
        <div className="events-grid">
          {events.map(event => (
            <div key={event.id} className="event-card">
              <h3>{event.name}</h3>
              <p className="venue">📍 {event.venue}</p>
              <p className="date">📅 {event.date}</p>
              <p className="price">{event.price} ETH</p>
              <p className="tickets-left">
                🎫 {event.totalTickets - event.ticketsSold} / {event.totalTickets} tickets left
              </p>
              <button
                className="btn btn-primary"
                onClick={() => handleBuy(event)}
                disabled={buyingId === event.id || event.ticketsSold >= event.totalTickets}
              >
                {buyingId === event.id ? 'Processing...' : 'Buy Ticket'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}