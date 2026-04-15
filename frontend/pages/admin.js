import { useState } from 'react';
import { ethers } from 'ethers';
import { connectWallet, getContract } from '../utils/contract';

export default function Admin() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [form, setForm] = useState({
    name: '',
    venue: '',
    date: '',
    price: '',
    totalTickets: '',
  });

  const handleConnect = async () => {
    const w = await connectWallet();
    if (w) setWallet(w);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async () => {
    // Connect wallet first if not connected
    let currentWallet = wallet;
    if (!currentWallet) {
      const w = await connectWallet();
      if (!w) return;
      setWallet(w);
      currentWallet = w;
    }

    try {
      setLoading(true);
      setMessage(null);

      const contract = getContract(currentWallet.signer);
      const dateTimestamp = Math.floor(new Date(form.date).getTime() / 1000);
      const priceWei = ethers.utils.parseEther(form.price.toString());

      const tx = await contract.createEvent(
        form.name,
        form.venue,
        dateTimestamp,
        priceWei,
        parseInt(form.totalTickets)
      );

      setMessage({ type: 'success', text: 'Transaction submitted — waiting for confirmation...' });
      await tx.wait();
      setMessage({ type: 'success', text: `Event created! TX: ${tx.hash.slice(0, 20)}...` });
      setForm({ name: '', venue: '', date: '', price: '', totalTickets: '' });

    } catch (err) {
      setMessage({ type: 'error', text: err.reason || err.message || 'Transaction failed.' });
    }
    setLoading(false);
  };

  const isFormValid = form.name && form.venue && form.date && form.price && form.totalTickets;

  return (
    <div className="container">
      <h1 style={{ margin: '2rem 0 0.5rem', fontSize: '2rem' }}>Admin Panel</h1>
      <p style={{ color: '#aaa', marginBottom: '2rem' }}>
        Create new events on the blockchain. Only the contract owner can create events.
      </p>

      {!wallet ? (
        <button className="btn btn-primary" onClick={handleConnect}>
          Connect MetaMask
        </button>
      ) : (
        <span className="wallet-info" style={{ display: 'inline-block', marginBottom: '1.5rem' }}>
          Connected: {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
        </span>
      )}

      {message && (
        <div className={`alert alert-${message.type}`} style={{ marginTop: '1rem' }}>
          {message.text}
        </div>
      )}

      <div style={{ maxWidth: '500px', marginTop: '1.5rem' }}>
        <div className="form-group">
          <label>Event Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Music Festival"
          />
        </div>
        <div className="form-group">
          <label>Venue</label>
          <input
            name="venue"
            value={form.venue}
            onChange={handleChange}
            placeholder="e.g. Convention Center, Downtown Hall"
          />
        </div>
        <div className="form-group">
          <label>Event Date</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Ticket Price (ETH)</label>
          <input
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="e.g. 0.01"
          />
        </div>
        <div className="form-group">
          <label>Total Tickets</label>
          <input
            name="totalTickets"
            value={form.totalTickets}
            onChange={handleChange}
            placeholder="e.g. 100"
          />
        </div>
        <button
          className="btn btn-primary"
          onClick={handleCreate}
          disabled={loading || !isFormValid}
        >
          {loading ? 'Creating...' : 'Create Event on Blockchain'}
        </button>
      </div>
    </div>
  );
}