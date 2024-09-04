"use client"; // Mark this file as a Client Component

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Explore({ onClose }) {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay background with blur */}
      <div className="fixed inset-0 bg-[#F9F7F7] bg-opacity-90 backdrop-blur-md" />

      {/* Content container */}
      <div className="relative z-20 w-full max-w-lg mx-auto p-6 bg-white rounded-lg shadow-lg">
        {/* Search bar positioned absolutely above the blurred background */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-full max-w-md p-4 z-10">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border border-[#3F72AF] rounded-lg"
            style={{
              backgroundColor: "white",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          />
        </div>

        {/* Flex container for Explore title and Close button */}
        <div className="flex justify-between items-center mt-16 mb-4">
          <h2 className="text-2xl font-bold text-[#112D4E]">
            Explore
          </h2>
          {/* <Button
            onClick={onClose}
            className="bg-[#F9F7F7] text-[#112D4E] hover:bg-[#3F72AF] hover:text-white"
          >
            Close
          </Button> */}
        </div>

        {/* Add your search results or additional content here */}
      </div>
    </div>
  );
}
