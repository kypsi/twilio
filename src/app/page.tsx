"use client";

import History from "@/components/History";
import { useState, ChangeEvent, useEffect } from "react";

interface HistoryItem {
  id: string;
  from: string;
  to: string;
  message: string;
  date: string;
}

const Home = () => {
  const [numbers, setNumbers] = useState<string[]>([]);
  const [message, setMessage] = useState<string>("");
  const [phoneInput, setPhoneInput] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);


  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/message-history");
      const data = await res.json();

      if (res.ok) {
        setHistory(data.records);
        console.log(data.records)
      } else {
        console.error("Failed to fetch history", data.error);
      }
    } catch (err) {
      console.error("Error fetching history", err);
    } finally {
      setLoadingHistory(false);

    }
  };

  const isValidPhoneNumber = (num: string) => /^[\d+\s-]+$/.test(num.trim());


  const addNumber = () => {
    setError(""); // Reset error message

    if (!phoneInput.trim()) {
      setError("Phone number cannot be empty.");
      return;
    }

    if (!isValidPhoneNumber(phoneInput)) {
      setError("Invalid phone number format.");
      return;
    }

    if (numbers.includes(phoneInput.trim())) {
      setError("This number is already added.");
      return;
    }

    setNumbers((prev) => [...prev, phoneInput.trim()]);
    setPhoneInput("");
  };

  const removeNumber = (index: number) => {
    setNumbers((prev) => prev.filter((_, i) => i !== index));
  };

  const sendMessage = async () => {
    setStatus("");
    setError("");

    if (numbers.length === 0) {
      setError("Please add at least one phone number.");
      return;
    }

    if (!message.trim()) {
      setError("Message cannot be empty.");
      return;
    }

    setStatus("Sending...");

    try {
      console.log("Sending SMS to:", numbers, "Message:", message);

      const response = await fetch("/api/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numbers,
          message
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("Message sent successfully.");
        setNumbers([]);
        setMessage("");
        fetchHistory();
      } else {
        throw new Error(data.error || "Failed to send messages.");
      }

      setStatus("Messages sent successfully!");
      setNumbers([]);
      setMessage("");
    } catch (err) {
      console.error("Error sending SMS:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred.");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow-lg rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-4 text-center">Send SMS via Twilio</h2>

      {/* Phone Input Section */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Enter phone number"
          value={phoneInput}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setPhoneInput(e.target.value)}
          className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={addNumber}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 rounded"
        >
          Add
        </button>
      </div>

      {numbers.length > 0 && (
        <ul className="mb-4">
          {numbers.map((num, index) => (
            <li key={index} className="bg-gray-100 p-2 my-1 rounded flex justify-between items-center">
              <span>{num}</span>
              <button
                onClick={() => removeNumber(index)}
                className="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Message Input */}
      <textarea
        placeholder="Enter message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
        rows={4}
      ></textarea>

      {/* Send Button */}
      <button
        onClick={sendMessage}
        className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded"
      >
        Send Message
      </button>

      {/* Error & Status Messages */}
      {error && <p className="mt-4 text-center text-sm text-red-500">{error}</p>}
      {status && <p className="mt-4 text-center text-sm text-gray-700">{status}</p>}

      <button
        onClick={() => {
          setShowHistory(!showHistory);
          if (!showHistory) fetchHistory();
        }}
        className="fixed bottom-6 right-6 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-full shadow-lg transition-all"
      >
        {showHistory ? "Close History" : "View History"}
      </button>


      {showHistory && <History history={history} loading={loadingHistory} />}
    </div>
  );
};

export default Home;
