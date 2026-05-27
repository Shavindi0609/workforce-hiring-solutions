import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b border-slate-200 fixed top-0 left-0 right-0 z-50">
      <div className="container-global mx-auto flex items-center justify-between gap-4 px-6 py-3">
        <Link to="/candidate/basic" className="flex items-center gap-3">
          <img src={logo} alt="WHS logo" className="h-9 w-auto object-contain" />
          <h1 className="text-xl font-bold text-blue-900">Join Our Candidate Pool</h1>
        </Link>

        <div className="hidden sm:flex items-center gap-3 text-sm font-medium text-slate-500">
          <span>Complete your profile</span>
          <span className="text-slate-300">|</span>
          <span>WHS Candidate Portal</span>
        </div>
      </div>
    </nav>
  );
}