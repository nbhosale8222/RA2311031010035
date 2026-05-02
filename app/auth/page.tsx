"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, rollNo }),
      });

      if (response.ok) {
        router.push("/");
      } else {
        const errorData = await response.json();
        const errorMsg = errorData?.error || "Login failed";
        alert(`Authentication failed: ${errorMsg}`);
      }
    } catch (error: any) {
      alert(`Authentication error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-black">
          Sign In
        </h2>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded text-black"
            placeholder="e.g. nb3816@srmist.edu.in"
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Roll Number
          </label>
          <input
            type="text"
            value={rollNo}
            onChange={(e) => setRollNo(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded text-black"
            placeholder="e.g. RA2311031010035"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Authenticating..." : "Login"}
        </button>
      </form>
    </div>
  );
}
