"use client"; // Mark this file as a Client Component

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();

  return (
    <header className="flex justify-between bg-[#F9F7F7] shadow-md border-b-4 border-[#DBE2EF] mb-4">
      <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Title */}
        <div className="flex-grow flex items-center">
          <h1 
            className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#3F72AF] to-[#112D4E]"
            style={{ fontFamily: 'Cedarville Cursive, cursive' }}
          >
            The Other Side
          </h1>
        </div>

        {/* Left Side: Navbar Items */}
        <div className="flex items-center space-x-7">
          <button className="text-[#112D4E] hover:text-[#3F72AF] font-semibold">
            Home
          </button>
          <button className="text-[#112D4E] hover:text-[#3F72AF] font-semibold">
            Filter
          </button>
          <button className="text-[#112D4E] hover:text-[#3F72AF] font-semibold">
            Settings
          </button>
        </div>

        {/* Right Side: Get Started Button */}
        <div className="ml-4">
          <Button
            className="bg-[#112D4E] text-white py-2 px-4 rounded hover:bg-[#3F72AF]"
            onClick={() => router.push("/getstarted")}  // Navigates to /getstarted
          >
            Get Started
          </Button>
        </div>
      </nav>
    </header>
  );
}
  