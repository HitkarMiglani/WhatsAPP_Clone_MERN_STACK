import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ChatPage() {
  const navigate = useNavigate();
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const userData = localStorage.getItem("user_data");

    if (!token) {
      navigate("/login");
      return;
    }

    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
        setUser({
          phoneNumber: "+919876543210",
          isVerified: true,
        });
      }
    } else {
      setUser({
        phoneNumber: "+919876543210",
        isVerified: true,
      });
    }

    setSelectedChat({
      id: 1,
      name: "WhatsApp",
      lastMessage: "Welcome to WhatsApp! Start chatting with your friends.",
      time: "Just now",
      unread: 1,
      avatar: null,
      isWelcome: true,
    });
  }, [navigate]);

  const conversations = [
    {
      id: 1,
      name: "WhatsApp",
      lastMessage: "Welcome to WhatsApp! Start chatting with your friends.",
      time: "Just now",
      unread: 0,
      avatar: null,
      isWelcome: true,
    },
    {
      id: 2,
      name: "John Doe",
      lastMessage: "Hey, how are you?",
      time: "10:30 AM",
      unread: 0,
      avatar: null,
    },
    {
      id: 3,
      name: "Jane Smith",
      lastMessage: "See you tomorrow!",
      time: "Yesterday",
      unread: 0,
      avatar: null,
    },
  ];

  const messages = selectedChat
    ? selectedChat.isWelcome
      ? [
          {
            id: 1,
            text: `Welcome to WhatsApp! 🎉`,
            sender: "other",
            time: "Just now",
          },
          {
            id: 2,
            text: `Your phone number ${user?.phoneNumber} has been verified successfully.`,
            sender: "other",
            time: "Just now",
          },
          {
            id: 3,
            text: "You can now start chatting with your friends and family. Enjoy messaging! 📱",
            sender: "other",
            time: "Just now",
          },
        ]
      : [
          {
            id: 1,
            text: "Hey, how are you?",
            sender: "other",
            time: "10:30 AM",
          },
          {
            id: 2,
            text: "I'm doing great! How about you?",
            sender: "me",
            time: "10:32 AM",
          },
          {
            id: 3,
            text: "That's awesome! Want to hang out later?",
            sender: "other",
            time: "10:35 AM",
          },
        ]
    : [];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedChat) return;

    console.log("Sending message:", message);
    setMessage("");
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    navigate("/login");
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="flex flex-col w-1/3 bg-white border-r border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 text-white bg-green-600">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 mr-3 bg-green-700 rounded-full">
              <span className="text-sm font-semibold">
                {user ? getInitials(user.phoneNumber || "User") : "U"}
              </span>
            </div>
            <div>
              <h2 className="font-semibold">{user?.phoneNumber || "User"}</h2>
              <p className="text-xs text-green-100">
                {user?.isVerified ? "Verified" : "Not Verified"}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 transition-colors rounded-lg hover:bg-green-700"
            title="Logout"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 17v-3H9v-4h7V7l5 5-5 5M14 2a2 2 0 012 2v2h-2V4H4v16h10v-2h2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2h10z" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Search or start new chat"
              className="w-full py-2 pl-10 pr-4 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <svg
              className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setSelectedChat(conv)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedChat?.id === conv.id
                  ? "bg-green-50 border-green-200"
                  : ""
              }`}
            >
              <div className="flex items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mr-3 ${
                    conv.isWelcome ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  {conv.isWelcome ? (
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="white"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.386" />
                    </svg>
                  ) : (
                    <span className="font-semibold text-gray-600">
                      {getInitials(conv.name)}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {conv.name}
                    </h3>
                    <span className="text-xs text-gray-500">{conv.time}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-gray-600 truncate">
                      {conv.lastMessage}
                    </p>
                    {conv.unread > 0 && (
                      <span className="flex items-center justify-center w-5 h-5 text-xs text-white bg-green-500 rounded-full">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex flex-col flex-1">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center p-4 text-white bg-green-600">
              <div className="flex items-center justify-center w-10 h-10 mr-3 bg-green-700 rounded-full">
                <span className="text-sm font-semibold">
                  {getInitials(selectedChat.name)}
                </span>
              </div>
              <div>
                <h3 className="font-semibold">{selectedChat.name}</h3>
                <p className="text-sm text-green-100">Online</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender === "me" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.sender === "me"
                        ? "bg-green-500 text-white"
                        : "bg-white text-gray-800 border border-gray-200"
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.sender === "me" ? "text-green-100" : "text-gray-500"
                      }`}
                    >
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <form
                onSubmit={handleSendMessage}
                className="flex items-center space-x-2"
              >
                <button
                  type="button"
                  className="p-2 text-gray-500 transition-colors hover:text-gray-700"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </button>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="p-3 text-white transition-colors bg-green-500 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </form>
            </div>
          </>
        ) : (
          /* No Chat Selected */
          <div className="flex items-center justify-center flex-1 bg-gray-50">
            <div className="text-center">
              <div className="flex items-center justify-center w-32 h-32 mx-auto mb-4 bg-gray-200 rounded-full">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-gray-400"
                >
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-700">
                WhatsApp Web
              </h3>
              <p className="text-gray-500">Select a chat to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
