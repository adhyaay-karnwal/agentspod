"use client";
import Link from "next/link";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#docs", label: "Docs" },
  { href: "#signin", label: "Sign In" },
];

export default function Header() {
  return (
    <header className="w-full z-20 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-6">
        <div className="flex items-center space-x-3">
          {/* Wind Logo: Replace src with your real logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="inline-block rounded-full bg-gradient-to-tr from-sky-400 to-blue-600 p-2">
              <svg width="36" height="36" viewBox="0 0 60 60" fill="none">
                <circle cx="30" cy="30" r="30" fill="url(#wind-gradient)" />
                <path d="M16 30c0-5.5 9-10 14-10s14 4.5 14 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                <defs>
                  <linearGradient id="wind-gradient" x1="0" y1="0" x2="60" y2="60" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#38bdf8" />
                    <stop offset="1" stopColor="#2563eb" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
            <span className="ml-2 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-sky-400 to-blue-700 tracking-tight">
              Wind
            </span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center space-x-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                "rounded-full px-5 py-2 transition font-medium text-gray-700 hover:bg-sky-100 hover:text-blue-700"
              }
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="#waitlist"
            className="rounded-full bg-gradient-to-tr from-sky-400 to-blue-600 text-white px-6 py-2 ml-3 font-semibold shadow-md hover:scale-105 transition-transform"
          >
            Join the Waitlist
          </Link>
        </nav>
        {/* Hamburger for Mobile */}
        <div className="md:hidden flex items-center">
          {/* You can implement a mobile menu here */}
        </div>
      </div>
    </header>
  );
}