from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import serial
import uvicorn

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Arduino connection
try:
    arduino = serial.Serial('/dev/cu.usbserial-1120', 9600, timeout=1)
    print("✅ Successfully connected to Arduino")
except Exception as e:
    print(f"❌ Failed to connect to Arduino: {e}")
    arduino = None

def get_latest_arduino_data():
    """Get the most recent data from Arduino"""
    if not arduino:
        return 0, 0

    # Clear old data
    arduino.flushInput()
    
    try:
        # Read the latest line
        line = arduino.readline().decode().strip()
        print(f"Arduino data: {line}")  # Debug print
        
        # Parse the values
        values = line.split()
        if len(values) == 2:
            return float(values[0]), float(values[1])
    except Exception as e:
        print(f"Error reading Arduino: {e}")
    
    return 0, 0

@app.get("/sensor-data")
async def get_sensor_data():
    left, right = get_latest_arduino_data()
    return {
        "left": left,
        "right": right,
        "status": "success"
    }

@app.get("/")
async def root():
    return {"status": "running", "arduino_connected": arduino is not None}

if __name__ == "__main__":
    print("🚀 Starting server on http://localhost:8000")
    uvicorn.run(app, host="127.0.0.1", port=8000) 