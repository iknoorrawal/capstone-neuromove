import serial
import asyncio
import time
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from typing import List, Dict

# Constants
PORT = "COM6"
BAUD_RATE = 9600
THRESHOLD = 0.5  # Adjust based on your force strip sensitivity

# Initialize FastAPI app
app = FastAPI(title="Arduino Force Sensor Bridge")

# Configure CORS to allow React app to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your React app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize serial connection
try:
    arduino = serial.Serial(PORT, BAUD_RATE, timeout=1)
    print(f"Successfully opened serial port {PORT}")
except Exception as e:
    print(f"Error opening serial port: {e}")
    # We'll continue running the app even if Arduino is not connected
    arduino = None

# Store active connections
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"Client connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        print(f"Client disconnected. Total connections: {len(self.active_connections)}")

    async def broadcast(self, message: Dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                print(f"Error sending to client: {e}")

manager = ConnectionManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Just keep the connection alive - actual data is sent by the background task
        while True:
            # We'll receive any messages but don't do anything with them
            # This just keeps the connection open
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Background task to read Arduino data and broadcast to all clients
@app.on_event("startup")
async def startup_event():
    asyncio.create_task(read_arduino_data())

async def read_arduino_data():
    """Read data from Arduino and broadcast to all WebSocket clients."""
    print("Starting Arduino data reading...")
    
    # If arduino connection failed, send dummy data
    if arduino is None:
        print("Arduino not connected. Sending dummy data.")
        while True:
            await manager.broadcast({
                "left": 0.0,
                "right": 0.0,
                "left_pressed": False,
                "right_pressed": False,
                "connected": False
            })
            await asyncio.sleep(0.1)
        return
    
    while True:
        try:
            if arduino.in_waiting:
                # Read a line from the Arduino
                data = arduino.readline().decode().strip()
                print(f"Raw data from Arduino: {data}")
                
                try:
                    # Parse the two force values
                    left_force, right_force = map(float, data.split())
                    print(f"Left force: {left_force}, Right force: {right_force}")
                    
                    # Detect "button press" based on force threshold
                    left_pressed = left_force > THRESHOLD
                    right_pressed = right_force > THRESHOLD
                    
                    # Broadcast to all connected clients
                    await manager.broadcast({
                        "left": left_force,
                        "right": right_force,
                        "left_pressed": left_pressed,
                        "right_pressed": right_pressed,
                        "connected": True
                    })
                    
                except ValueError as e:
                    print(f"Error parsing data: {e}")
            
            # Yield control back to event loop
            await asyncio.sleep(0.01)
            
        except Exception as e:
            print(f"Error in read_arduino_data: {e}")
            await asyncio.sleep(1)  # Wait a bit before trying again


if __name__ == "__main__":
    print("Starting FastAPI server...")
    uvicorn.run(app, host="0.0.0.0", port=8000)