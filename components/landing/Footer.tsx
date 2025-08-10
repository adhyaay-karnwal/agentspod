"use client";
import Link from "next/link";

const socials = [
  {
    href: "https://twitter.com/",
    label: "Twitter",
    icon: (
      <svg width="24" height="24" fill="none">
        <path
          d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0022.4.36a8.88 8.88 0 01-2.83 1.08A4.48 4.48 0 0016.1 0c-2.5 0-4.52 2.02-4.52 4.5 0 .35.04.68.1 1A12.8 12.8 0 013 1.1a4.52 4.52 0 001.4 6.04A4.52 4.52 0 012 6.14v.06c0 2.2 1.57 4.04 3.69 4.46a4.48 4.48 0 01-2.04.08c.57 1.78 2.22 3.07 4.18 3.1A9.07 9.07 0 012 19.54a12.8 12.8 0 006.92 2.03c8.29 0 12.83-6.86 12.83-12.83 0-.2 0-.4-.02-.6A9.19 9.19 0 0023 3z"
          fill="#38bdf8"
        />
      </svg>
    ),
  },
  {
    href: "https://github.com/",
    label: "GitHub",
    icon: (
      <svg width="24" height="24" fill="none">
        <path
          d="M12 .3a12 12 0 00-3.79 23.4c.6.11.82-.26.82-.58v-2.1c-3.34.73-4.04-1.61-4.04-1.61-.54-1.38-1.32-1.75-1.32-1.75-1.08-.73.08-.71.08-.71 1.19.08 1.81 1.23 1.81 1.23 1.06 1.82 2.78 1.29 3.46.99.11-.77.41-1.29.75-1.59-2.67-.31-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.31-.54-1.54.12-3.22 0 0 1.01-.32 3.3 1.23a11.54 11.54 0 016 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.68.24 2.91.12 3.22.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.62-5.47 5.93.42.36.8 1.08.8 2.18v3.23c0 .32.22.7.82.58A12 12 0 0012 .3z"
          fill="#2563eb"
        />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="bg-white border-t border-blue-50 py-8 mt-16">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-6">
        <div className="mb-4 md:mb-0">
          <span className="font-semibold text-gray-700 text-lg">© {new Date().getFullYear()} Wind</span>
        </div>
        <div className="flex items-center space-x-6 mb-4 md:mb-0">
          <Link href="#features" className="text-gray-500 hover:text-blue-600 transition">Features</Link>
          <Link href="#pricing" className="text-gray-500 hover:text-blue-600 transition">Pricing</Link>
          <Link href="#docs" className="text-gray-500 hover:text-blue-600 transition">Docs</Link>
        </div>
        <div className="flex items-center space-x-4">
          {socials.map((s) => (
            <a
              href={s.href}
              key={s.label}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="hover:scale-110 transition-transform"
            >
              {s.icon}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}