import { useState } from 'react';
import { connectWallet, getContract } from '../utils/contract';

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleConnect = async () => {
    const w = await connectWallet();
    if (!w) return;
    setWallet(w);
    loadTickets(w);
  };

  const loadTickets = async (w) => {
    setLoading(true);
    try {
      const contract = getContract(w.provider);
      const tokenIds = await contract.getUserTickets(w.address);
      const loaded = [];
      for (const id of tokenIds) {
        const ticket = await contract.getTicket(id);
        const event = await contract.events(ticket.eventId);
        loaded.push({
          tokenId: Number(id),
          eventName: event[0],
          venue: event[1],
          date: new Date(Number(event[2]) * 1000).toLocaleDateString(),
          isUsed: ticket.isUsed,
        });
      }
      setTickets(loaded);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load tickets.' });
    }
    setLoading(false);
  };

  const handleUseTicket = async (tokenId) => {
    try {
      setMessage(null);
      const contract = getContract(wallet.signer);
      const tx = await contract.useTicket(tokenId);
      setMessage({ type: 'success', text: 'Ticket marked as used — waiting for confirmation...' });
      await tx.wait();
      setMessage({ type: 'success', text: 'Ticket used successfully!' });
      loadTickets(wallet);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to use ticket.' });
    }
  };

  return (
    <div className="container">
      <h1 style={{ margin: '2rem 0 1rem', fontSize: '2rem' }}>My Tickets</h1>

      {!wallet ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: '#aaa', marginBottom: '1rem' }}>
            Connect your wallet to view your tickets.
          </p>
          <button className="btn btn-primary" onClick={handleConnect}>
            Connect MetaMask
          </button>
        </div>
      ) : (
        <>
          <p className="wallet-info" style={{ marginBottom: '1.5rem', display: 'inline-block' }}>
            {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
          </p>

          {message && (
            <div className={`alert alert-${message.type}`}>{message.text}</div>
          )}

          {loading ? (
            <div className="loading">Loading your tickets...</div>
          ) : tickets.length === 0 ? (
            <div className="loading">You have no tickets yet.</div>
          ) : (
            tickets.map(ticket => (
              <div key={ticket.tokenId} className="ticket-card">
                <p className="token-id">NFT Token #{ticket.tokenId}</p>
                <h3>{ticket.eventName}</h3>
                <p style={{ color: '#48cae4', fontSize: '0.9rem' }}>📍 {ticket.venue}</p>
                <p style={{ color: '#aaa', fontSize: '0.85rem', margin: '0.5rem 0' }}>📅 {ticket.date}</p>
                <span className={`badge ${ticket.isUsed ? 'badge-used' : 'badge-valid'}`}>
                  {ticket.isUsed ? 'Used' : 'Valid'}
                </span>
                {!ticket.isUsed && (
                  <button
                    className="btn btn-success"
                    style={{ marginLeft: '1rem' }}
                    onClick={() => handleUseTicket(ticket.tokenId)}
                  >
                    Use Ticket
                  </button>
                )}
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
}