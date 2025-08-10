"use client";
import dynamic from "next/dynamic";

const Header = dynamic(() => import("@/components/landing/Header"), { ssr: false });
const Hero = dynamic(() => import("@/components/landing/Hero"), { ssr: false });
const Features = dynamic(() => import("@/components/landing/Features"), { ssr: false });
const Footer = dynamic(() => import("@/components/landing/Footer"), { ssr: false });

export default function Home() {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Hero />
        <Features />
      </main>
      <Footer />
    </div>
  );
}