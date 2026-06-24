import { Search } from "lucide-react";
import Link from "next/link";

export const Navbar = () => {
  return (
    <nav className="w-full bg-zinc-800 text-zinc-300">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-semibold text-xl text-zinc-100">
          pianote
        </Link>

        <div className="flex items-center bg-zinc-700 rounded-xl px-3 w-80 focus-within:ring-2 focus-within:ring-emerald-500 transition">
          <Search size={20} className="text-zinc-400" />
          <input
            type="text"
            placeholder="search..."
            className="bg-transparent text-zinc-100 placeholder-zinc-400 px-2 py-2 w-full focus:outline-none"
          />
        </div>

        <Link href="/login" className="hover:text-zinc-50 text-lg">
          login
        </Link>
      </div>
    </nav>
  );
};
