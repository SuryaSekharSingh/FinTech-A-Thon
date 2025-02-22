// Initialize WebSocket connection
export const signalingServer = new WebSocket("ws://192.168.224.96:8000");

// Get user ID (simple prompt for testing)
export const user_id = prompt("Enter your user ID (e.g., user1):");

// Register with the server
signalingServer.onopen = () => {
    console.log("✅ WebSocket Connected");
    signalingServer.send(JSON.stringify({ type: "register", user_id }));
};

signalingServer.onerror = (error) => console.error("❌ WebSocket Error:", error);