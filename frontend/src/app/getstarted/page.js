"use client"; // Mark this file as a Client Component

import { useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter for navigation
import { Button } from "@/components/ui/button";

export default function GetStarted() {
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter(); // Initialize useRouter for redirecting

  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint = isSignUp ? "/api/auth/signup" : "/api/auth/login";

    const formData = new FormData(e.target);
    const userData = isSignUp
      ? {
          name: formData.get("name"),
          email: formData.get("email"),
          password: formData.get("password"),
        }
      : {
          identifier: formData.get("username"),
          password: formData.get("password"),
        }; // Use 'identifier' for either email or username

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const result = await response.json();
    if (result.token) {
      // Store token, e.g., in localStorage
      localStorage.setItem("token", result.token);
      localStorage.setItem(
        "username",
        isSignUp ? formData.get("name") : formData.get("username")
      ); // Store username
      alert("Logged in successfully");
      router.push("/"); // Redirect to main page after login
    } else if (response.status === 200 && isSignUp) {
      alert("Signed up successfully");
      router.push("/login"); // Redirect to login page after sign-up
    } else {
      alert(result.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F7F7]">
      <div className="w-full max-w-sm p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center text-[#112D4E] mb-6">
          {isSignUp ? "Sign Up" : "Get Started"}
        </h2>
        {isSignUp ? (
          // Sign Up Form
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-[#3F72AF] font-semibold mb-2"
              >
                Username
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter your username"
                className="w-full p-3 border border-[#DBE2EF] rounded-lg"
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-[#3F72AF] font-semibold mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                className="w-full p-3 border border-[#DBE2EF] rounded-lg"
                required
              />
            </div>

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
                name="password"
                placeholder="Enter your password"
                className="w-full p-3 border border-[#DBE2EF] rounded-lg"
                required
              />
            </div>

            <Button className="w-full bg-[#112D4E] text-white py-3 rounded-lg hover:bg-[#3F72AF]">
              Sign Up
            </Button>
          </form>
        ) : (
          // Log In Form
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="username"
                className="block text-[#3F72AF] font-semibold mb-2"
              >
                Username or Email
              </label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Enter your username or email"
                className="w-full p-3 border border-[#DBE2EF] rounded-lg"
                required
              />
            </div>

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
                name="password"
                placeholder="Enter your password"
                className="w-full p-3 border border-[#DBE2EF] rounded-lg"
                required
              />
            </div>

            <Button className="w-full bg-[#112D4E] text-white py-3 rounded-lg hover:bg-[#3F72AF]">
              Log In
            </Button>
          </form>
        )}

        <div className="mt-6 text-center">
          {isSignUp ? (
            <p className="text-[#3F72AF]">
              Already have an account?{" "}
              <button
                onClick={() => setIsSignUp(false)}
                className="text-[#112D4E] font-bold hover:underline"
              >
                Log In
              </button>
            </p>
          ) : (
            <p className="text-[#3F72AF]">
              Not a user?{" "}
              <button
                onClick={() => setIsSignUp(true)}
                className="text-[#112D4E] font-bold hover:underline"
              >
                Sign Up
              </button>
            </p>
          )}
        </div>

        {!isSignUp && (
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
        )}
      </div>
    </div>
  );
}
