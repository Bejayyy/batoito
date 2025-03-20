import React, { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import axios from "axios";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! How can I assist you with our photography services?", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // FAQ Responses
  const faqResponses = {
    "services": "We offer portrait, wedding, product, and event photography. Visit our Services page for details.",
    "book": "You can book a session through our Booking form found on our Contact page, which connects to email for confirmation.",
    "edit": "Yes! We provide professional retouching and editing for all sessions.",
    "price": "Pricing depends on the package. Check our Services page for details.",
    "location": "We are based in [Your Location] and offer travel sessions for special events.",
    "gallery": "Yes! Explore our high-resolution galleries categorized by photography type on the Portfolio page.",
    "delivery": "Photos are usually delivered in 1-2 weeks. Printed albums may take longer.",
    "discount": "We sometimes offer promotions. Follow us on social media or check our website for updates.",
    "contact": "You can contact us via Messenger chat, our Contact page, or by phone.",
    "payment": "We accept payments via credit card, PayPal, and bank transfer.",
    "cancellation": "If you need to cancel, please notify us at least 48 hours in advance. Deposits may be non-refundable.",
    "reschedule": "You can reschedule with at least 48 hours’ notice, subject to availability.",
  };

  const getFAQResponse = (userInput) => {
    userInput = userInput.toLowerCase();
    for (let keyword in faqResponses) {
      if (userInput.includes(keyword)) {
        return faqResponses[keyword];
      }
    }
    return null;
  };

  const fetchAIResponse = async (question) => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `
                You are Norlitz, an intelligent, friendly, and professional photography assistant. 
                You specialize in helping clients with inquiries about photography services such as booking, pricing, photography types (portrait, wedding, event, etc.), and photo editing.
                In addition to answering specific photography-related questions, you can provide a brief overview of the website, explaining the types of services we offer, how to book, and where users can find more detailed information.
                Your responses should be friendly and detailed, offering helpful suggestions when necessary. If a question cannot be answered directly from the FAQ list, suggest the user visit the website or contact customer support for more information.
                If the user asks about the website itself or general business information, provide a concise introduction to the website and services. For example, you could explain that we specialize in portrait, event, and product photography, and that booking can be done via our online form.  
              `
            },
            { role: "user", content: question }
          ]
        },
        {
            headers: {
                "Authorization": `Bearer YOUR_OPENAI_API_KEY`, // Replace with your actual API key
                "Content-Type": "application/json"
              }
        }
      );
  
      setIsLoading(false);
      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setIsLoading(false);
      return "Sorry, I couldn't process your question. Please visit our website for details.";
    }
  };
  
  const handleSendMessage = async () => {
    if (input.trim() === "") return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { text: userMessage, sender: "user" }]);

    let botResponse = getFAQResponse(userMessage);

    if (!botResponse) {
      botResponse = await fetchAIResponse(userMessage);
    }

    setMessages(prev => [...prev, { text: botResponse, sender: "bot" }]);
    setInput("");
  };

  return (
    <>
      {/* Chat Icon */}
      <button
        className="fixed bottom-6 right-6 bg-black text-white p-3 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-800 transition-all"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-16 right-6 w-80 bg-white shadow-xl rounded-lg overflow-hidden flex flex-col border border-gray-300">
          {/* Chat Header */}
          <div className="bg-black text-white p-3 flex justify-between items-center">
            <span className="font-semibold text-lg">Norlitz Bato Chat</span>
            <button onClick={() => setIsOpen(false)} className="text-white">
              <X size={20} />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-3 space-y-2 overflow-y-auto max-h-64">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-2 rounded-lg max-w-full break-words ${msg.sender === "bot" ? "bg-gray-200 text-black text-left" : "bg-black text-white text-right"}`}
              >
                {msg.text}
              </div>
            ))}
            {isLoading && <div className="p-2 bg-gray-200 text-black text-left">Thinking...</div>}
          </div>

          {/* Chat Input */}
          <div className="p-3 border-t flex items-center space-x-2">
            <input
              type="text"
              className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black transition duration-300"
              placeholder="Ask about our services..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <button
              onClick={handleSendMessage}
              className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-all"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;