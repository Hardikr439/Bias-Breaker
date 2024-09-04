"use client"; // Mark this file as a Client Component

import { Button } from "@/components/ui/button";

export default function GetStarted() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F7F7]">
      <div className="w-full max-w-sm p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center text-[#112D4E] mb-6">
          Get Started
        </h2>
        <form>
          {/* Username Input */}
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-[#3F72AF] font-semibold mb-2"
            >
              Username
            </label>
            <input  
              type="text"
              id="username"
              placeholder="Enter your username"
              className="w-full p-3 border border-[#DBE2EF] rounded-lg"
            />
          </div>

          {/* Password Input */}
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-[#3F72AF] font-semibold mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              className="w-full p-3 border border-[#DBE2EF] rounded-lg"
            />
          </div>

          {/* Submit Button */}
          <Button className="w-full bg-[#112D4E] text-white py-3 rounded-lg hover:bg-[#3F72AF]">
            Log In
          </Button>
        </form>

        {/* Social Login Options */}
        <div className="mt-6">
          <p className="text-center text-[#3F72AF] font-semibold mb-4">
            Or log in with
          </p>
          <div className="flex justify-center space-x-4">
            <Button className="bg-[#DBE2EF] text-[#112D4E] py-2 px-4 rounded-lg hover:bg-[#3F72AF]">
              Google
            </Button>
            <Button className="bg-[#DBE2EF] text-[#112D4E] py-2 px-4 rounded-lg hover:bg-[#3F72AF]">
              LinkedIn
            </Button>
            <Button className="bg-[#DBE2EF] text-[#112D4E] py-2 px-4 rounded-lg hover:bg-[#3F72AF]">
              GitHub
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
