"use client"; // Mark this file as a Client Component

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { AiOutlineLeft, AiOutlineRight } from "react-icons/ai";
import { Card } from "@/components/ui/card"; // ShadCN Card component

export default function Content() {
  const [showOverlay, setShowOverlay] = useState(false);
  const carouselRef = useRef(null);
  const cardCount = 7;

  useEffect(() => {
    const carousel = carouselRef.current;
    let intervalId;

    if (carousel) {
      // Clone the first cards to create an infinite loop illusion
      const handleInfiniteScroll = () => {
        if (
          carousel.scrollLeft >=
          carousel.scrollWidth - carousel.clientWidth
        ) {
          // Reset scroll position to the start (with a slight delay to create the loop illusion)
          carousel.scrollLeft = 0;
        }
      };

      // Automatically scroll at intervals
      intervalId = setInterval(() => {
        if (carousel) {
          carousel.scrollLeft += carousel.clientWidth / 3; // Scroll by a third of the carousel width
          handleInfiniteScroll();
        }
      }, 2000); // Adjust the speed of automatic scrolling (2 seconds)

      // Cleanup interval on unmount
      return () => {
        clearInterval(intervalId);
      };
    }
  }, []);

  // Manual scroll
  const scrollLeft = () => {
    const carousel = carouselRef.current;
    carousel.scrollLeft -= carousel.clientWidth / 2; // Scroll half of the container's width
  };

  const scrollRight = () => {
    const carousel = carouselRef.current;
    carousel.scrollLeft += carousel.clientWidth / 2;
  };

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
            Our advanced NLP and Deep Learning algorithms break down news into
            every aspect, giving you a clear and unbiased view of the story.
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

        <Link
          href="/Analysis"
          className="block w-full lg:w-1/4 h-[calc(100vh-8rem)]"
        >
          <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col justify-between h-full cursor-pointer hover:shadow-2xl transition-shadow duration-300">
            <h2 className="text-2xl font-semibold text-[#112D4E] mb-4">
              Large Card Title
            </h2>
            <p className="text-[#3F72AF] mb-4">
              This large card is positioned to the right of the main content and
              takes up the full height.
            </p>
            <span className="text-[#3F72AF] hover:text-[#112D4E] font-semibold">
              Read More
            </span>
          </div>
        </Link>
      </div>

      {/* Infinite Scrolling Horizontal Cards */}
      <div className="relative mt-8">
        <h2 className="text-2xl font-bold text-[#112D4E] mb-4">
          Scroll Through the Cards
        </h2>

        {/* Left Arrow Button */}
        <button
          onClick={scrollLeft}
          className="absolute top-1/2 -left-4 transform -translate-y-1/2 z-10 bg-[#3F72AF] text-white p-2 rounded-full hover:bg-[#112D4E]"
        >
          <AiOutlineLeft size={24} />
        </button>

        <div ref={carouselRef} className="flex gap-8 overflow-hidden w-full">
          {Array.from({ length: cardCount }).map((_, index) => (
            <Card
              key={index}
              className="bg-white rounded-lg shadow-lg p-6 flex-shrink-0 h-72 w-80"
            >
              <h2 className="text-xl font-semibold text-[#112D4E] mb-4">
                Card Title {index + 1}
              </h2>
              <p className="text-[#3F72AF] mb-4">
                This is a dummy card with some placeholder text. It may vary in
                size and content.
              </p>
              <Link href={`/card/${index + 1}`}>
                <span className="text-[#3F72AF] hover:text-[#112D4E] font-semibold cursor-pointer">
                  Read More
                </span>
              </Link>
            </Card>
          ))}
          {/* Cloning the first few cards to create the infinite scroll effect */}
          {Array.from({ length: 3 }).map((_, index) => (
            <Card
              key={`clone-${index}`}
              className="bg-white rounded-lg shadow-lg p-6 flex-shrink-0 h-72 w-80"
            >
              <h2 className="text-xl font-semibold text-[#112D4E] mb-4">
                Card Title {index + 1}
              </h2>
              <p className="text-[#3F72AF] mb-4">
                This is a dummy card with some placeholder text. It may vary in
                size and content.
              </p>
              <Link href={`/card/${index + 1}`}>
                <span className="text-[#3F72AF] hover:text-[#112D4E] font-semibold cursor-pointer">
                  Read More
                </span>
              </Link>
            </Card>
          ))}
        </div>

        {/* Right Arrow Button */}
        <button
          onClick={scrollRight}
          className="absolute top-1/2 -right-4 transform -translate-y-1/2 z-10 bg-[#3F72AF] text-white p-2 rounded-full hover:bg-[#112D4E]"
        >
          <AiOutlineRight size={24} />
        </button>
      </div>

      {/* Call to Action: Sign In */}
      <div className="relative mt-12">
        <div className="w-full h-48 bg-[#112D4E] text-white rounded-lg shadow-lg p-8 flex justify-between items-center transition-all duration-300 hover:bg-[#DBE2EF] hover:text-[#112D4E] hover:shadow-xl relative">
          {/* Fake Upper Border */}
          <div className="absolute top-0 left-0 w-full h-2 bg-[#3F72AF]" />

          <div>
            <h2 className="text-5xl font-bold">
              Stay informed with The Other Side
            </h2>
            <p className="mt-2 text-lg font-light">
              Get access to a diverse range of news from different sources.
            </p>
          </div>

          <Link href="/getstarted">
            <Button className="bg-white text-[#112D4E] hover:bg-[#3F72AF] hover:text-white transition-transform transform hover:scale-105 px-8 py-4 rounded-lg text-xl">
              Sign In
            </Button>
          </Link>
        </div>
      </div>

      {/* Overlay for Explore page */}
      {showOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F9F7F7] bg-opacity-90">
          <div className="relative w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
            <input
              type="text"
              placeholder="Search..."
              className="w-full p-3 border border-[#3F72AF] rounded-lg mb-4"
              style={{
                backgroundColor: "white",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            />
            <div className="flex gap-2">
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
