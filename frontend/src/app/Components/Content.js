"use client"; // Mark this file as a Client Component

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { useState } from 'react';

export default function Content() {
  const [showOverlay, setShowOverlay] = useState(false);

  return (
    <div className="bg-[#F9F7F7] min-h-screen flex flex-col pl-8">
      {/* Main Content and Large Card */}
      <div className="relative flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="text-left max-w-4xl p-12 bg-[#DBE2EF] rounded-lg shadow-lg flex-grow">
          <h1 className="text-6xl font-bold text-[#112D4E] mb-4">
            Discover the True Story Behind Every News
          </h1>
          <p className="text-2xl text-[#3F72AF] mb-8">
            Our advanced NLP and Deep Learning algorithms break down news into every aspect, giving you a clear and unbiased view of the story.
          </p>
          <div className="flex space-x-8 mb-12">
            <Button
              onClick={() => setShowOverlay(true)}
              className="bg-[#3F72AF] hover:bg-[#112D4E] text-white px-8 py-4 rounded-lg text-xl"
            >
              Explore Now
            </Button>
            <Link href="/learn-more">
              <Button className="bg-[#112D4E] hover:bg-[#3F72AF] text-white px-8 py-4 rounded-lg text-xl">
                Learn More
              </Button>
            </Link>
          </div>
        </div>

        {/* Large Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col justify-between w-full lg:w-1/4 h-[calc(100vh-8rem)]">
          <h2 className="text-2xl font-semibold text-[#112D4E] mb-4">Large Card Title</h2>
          <p className="text-[#3F72AF] mb-4">This large card is positioned to the right of the main content and takes up the full height.</p>
          <Link href={`/card/large`}>
            <span className="text-[#3F72AF] hover:text-[#112D4E] font-semibold cursor-pointer">Read More</span>
          </Link>
        </div>
      </div>

      {/* Smaller Cards Below */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
        {Array.from({ length: 7 }).map((_, index) => (
          <div
            key={index}
            className={`bg-white rounded-lg shadow-lg p-6 flex flex-col justify-between ${index % 3 === 0 ? 'h-72' : index % 2 === 0 ? 'h-64' : 'h-80'} ${index % 2 === 0 ? 'col-span-2' : ''}`}
          >
            <h2 className="text-xl font-semibold text-[#112D4E] mb-4">Card Title {index + 1}</h2>
            <p className="text-[#3F72AF] mb-4">This is a dummy card with some placeholder text. It may vary in size and content.</p>
            <Link href={`/card/${index + 1}`}>
              <span className="text-[#3F72AF] hover:text-[#112D4E] font-semibold cursor-pointer">Read More</span>
            </Link>
          </div>
        ))}
      </div>

      {/* Overlay for Explore page */}
      {showOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F9F7F7] bg-opacity-90">
          <div className="relative w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
            <input
              type="text"
              placeholder="Search..."
              className="w-full p-3 border border-[#3F72AF] rounded-lg mb-4"
              style={{ backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
            />
            <div className='flex gap-2'>
            <Button
              onClick={() => setShowOverlay(false)}
              className="absolute bottom-9 right-2 bg-[#F9F7F7] text-[#112D4E] hover:bg-[#3F72AF] hover:text-white"
            >
              Close
            </Button>
            
                 </div>
            {/* Additional content for Explore page */}
            <h2 className="text-2xl font-bold text-[#112D4E] mb-4">Explore</h2>
            <p className="text-[#3F72AF]">This is the Explore page content.</p>
          </div>
        </div>
      )}
    </div>
  );
}
