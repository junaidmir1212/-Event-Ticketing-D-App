import '../styles/globals.css';
import Link from 'next/link';

function Navbar() {
  return (
    <nav className="navbar">
      <Link href="/" className="navbar-brand">
        🎫 EventChain
      </Link>
      <ul className="navbar-links">
        <li><Link href="/">Events</Link></li>
        <li><Link href="/my-tickets">My Tickets</Link></li>
        <li><Link href="/admin">Admin</Link></li>
      </ul>
    </nav>
  );
}

export default function App({ Component, pageProps }) {
  return (
    <>
      <Navbar />
      <Component {...pageProps} />
    </>
  );
}