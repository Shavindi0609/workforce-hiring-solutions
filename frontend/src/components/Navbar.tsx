import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b border-slate-200 fixed top-0 left-0 right-0 z-50">
      <div className="container-global mx-auto flex items-center justify-between gap-4 px-6 py-2">
        <Link to="/candidate/basic" className="flex items-center gap-3">
           <div className="p-[3px] rounded-full bg-gradient-to-r from-blue-500 to-green-500 inline-block">
             <img 
                 src={logo} 
                 alt="WHS logo" 
                className="h-12 w-auto object-contain rounded-full bg-white"
              />
           </div>
          <h1 className="text-xl font-bold text-blue-900">Join Our Candidate Pool</h1>
        </Link>

      </div>
    </nav>
  );
}