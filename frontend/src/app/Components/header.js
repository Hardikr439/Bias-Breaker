"use client"; // Mark this file as a Client Component

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut } from "lucide-react"; // Changed from IconLogout to LogOut

export default function Header() {
  const [username, setUsername] = useState(null); // State to hold username
  const router = useRouter();

  useEffect(() => {
    // Fetch the username from localStorage (if available)
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handleSignOut = () => {
    // Clear user session data
    localStorage.removeItem('username');
    localStorage.removeItem('token');
    setUsername(null); // Reset username state
    alert('Signed out successfully');
    router.push('/getstarted'); // Redirect to the get started page
  };

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

        {/* Right Side: User Profile or Get Started Button */}
        <div className="ml-4">
          {username ? (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://github.com/shadcn.png" alt={username} />
                    <AvatarFallback>{username.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-[#112D4E] font-semibold">{username}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48">
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 w-full justify-start text-red-600 hover:bg-gray-100"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </Button>
              </PopoverContent>
            </Popover>
          ) : (
            <Button
              className="bg-[#112D4E] text-white py-2 px-4 rounded hover:bg-[#3F72AF]"
              onClick={() => router.push("/getstarted")}
            >
              Get Started
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}