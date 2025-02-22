import asyncio
import websockets
import json

clients = {}

async def handle_connection(websocket, path):
    try:
        async for message in websocket:
            data = json.loads(message)
            
            # Register user
            if "type" in data and data["type"] == "register":
                user_id = data["user_id"]
                clients[user_id] = websocket
                print(f"✅ Registered: {user_id}")
            
            # Relay all other messages
            elif "to" in data:
                target_user = data["to"]
                if target_user in clients:
                    await clients[target_user].send(json.dumps(data))

    except websockets.exceptions.ConnectionClosed:
        disconnected = [k for k, v in clients.items() if v == websocket]
        for user in disconnected:
            del clients[user]
            print(f"❌ Disconnected: {user}")

async def start_server():
    print("🚀 WebSocket Server running on ws://192.168.224.96:8000")
    async with websockets.serve(handle_connection, "192.168.224.96", 8000):
        await asyncio.Future()

asyncio.run(start_server())