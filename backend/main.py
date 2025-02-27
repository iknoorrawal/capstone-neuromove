import random
import subprocess
from fastapi import Body, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from BalanceQuest.constants import Faces, Flags, Foods, Fruits, Animals, HandSymbols, Nature, Sports, Clothing
from config import get_level_config
import serial
import uvicorn
import time

app = FastAPI()

# Allowed origins
origins = [
    "http://localhost:3000",  # Frontend origin
    "run-",  # Alternate localhost
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allow specific origins
    allow_credentials=True,  # Allow cookies and auth headers
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Initialize Arduino connection
try:
    arduino = serial.Serial('/dev/cu.usbserial-1120', 9600, timeout=1)
    print("✅ Successfully connected to Arduino")
except Exception as e:
    print(f"❌ Failed to connect to Arduino: {e}")
    arduino = None

class GameProcess:
    def __init__(self):
        self.process = None
        self.scores = None

game_state = GameProcess()

def get_level_config(level):
    configs = {
        1: {"total_bubbles": 5, "correct_numbers": 2, "max_range": 20},
        2: {"total_bubbles": 8, "correct_numbers": 3, "max_range": 50},
        3: {"total_bubbles": 10, "correct_numbers": 4, "max_range": 100}
    }
    return configs.get(level, configs[1])  # Default to level 1 if invalid

@app.get("/get-number")
async def generate_random_number(level: int = 1):
    config = get_level_config(level)
    numbers = []
    
    # Generate correct numbers to find
    while len(numbers) < config["correct_numbers"]:
        num = random.randint(1, config["max_range"])
        if num not in numbers:
            numbers.append(num)
            
    return {"numbers": numbers, "config": config}

@app.post("/run-script")
async def run_script(numbers: dict = Body(...)):
    try:
        print("Received request:", numbers)
        if game_state.process is None:
            numbers_list = numbers.get("numbers", [])
            level = numbers.get("level", 1)
            config = get_level_config(level)
            
            numbers_arg = ' '.join(map(str, numbers_list))
            config_arg = f"{config['total_bubbles']} {config['max_range']} {level}"  # Add level to config args
            
            process = subprocess.Popen(
                ["python", "hand_tracking.py", numbers_arg, config_arg],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            game_state.process = process
            return {"status": "started"}
            
        if game_state.process is not None:
            poll_result = game_state.process.poll()
            print(f"Poll result: {poll_result}")
            
            if poll_result is not None:
                stdout, stderr = game_state.process.communicate()
                print(f"Process output: {stdout}")
                print(f"Process errors: {stderr}")
                
                scores = {"correct": 0, "incorrect": 0, "duration": 0, "score": 0}  # Add score field
                for line in stdout.split('\n'):
                    print(f"Processing line: {line}")  # Debug line
                    if "Correct Selections:" in line:
                        scores["correct"] = int(line.split(":")[1].strip())
                    elif "Incorrect Attempts:" in line:
                        scores["incorrect"] = int(line.split(":")[1].strip())
                    elif "Duration:" in line:
                        scores["duration"] = float(line.split(":")[1].strip())
                    elif "Score:" in line:
                        scores["score"] = int(line.split(":")[1].strip())
                
                print(f"Final scores: {scores}")  # Debug line
                game_state.process = None
                return {
                    "status": "complete",
                    "scores": scores
                }
            
            return {"status": "running"}
            
    except Exception as e:
        print(f"Error in run_script: {str(e)}")  # Debug log
        if game_state.process:
            game_state.process = None
        return {"status": "error", "error": str(e)}

@app.get("/get-number")
async def generate_random_number():
    number1 = random.randint(1, 20)
    number2 = random.randint(1, 20)
    return {"number1": number1, "number2": number2}

CATEGORIES = {
    "Flags": Flags,
    "Sports": Sports,
    "Clothing": Clothing,
    "Fruits": Fruits,
    "Animals": Animals,
    "Nature": Nature,
    "Foods": Foods,
    "HandSymbols": HandSymbols,
    "Faces": Faces,
}

@app.get("/game")
async def get_game():
    # Select a random category
    category = random.choice(list(CATEGORIES.items()))
    category_name, category_emojis = category
    
    # Select 3 random emojis from the category for initial display
    initial_emojis = random.sample(category_emojis, 3)
    
    # Create list of all emojis for guessing
    all_emojis = []
    
    # Add 6 emojis from the chosen category (marked as inGroup=True)
    category_selections = random.sample(category_emojis, 6)
    for emoji in category_selections:
        all_emojis.append({"emoji": emoji, "inGroup": True})
    
    # Add 6 emojis NOT from the chosen category (marked as inGroup=False)
    other_emojis = []
    for other_category, other_emojis in CATEGORIES.items():
        if other_category != category_name:
            other_emojis.extend(other_emojis)
    
    non_category_selections = random.sample(other_emojis, 6)
    for emoji in non_category_selections:
        all_emojis.append({"emoji": emoji, "inGroup": False})
    
    # Shuffle the combined list
    random.shuffle(all_emojis)
    
    # Create initial emojis list (without inGroup property)
    initial_emoji_objects = [{"emoji": emoji} for emoji in initial_emojis]
    
    return {
        "guessEmojis": all_emojis,
        "initialEmojis": initial_emoji_objects
    }

# Arduino data reading function
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

# Arduino sensor data endpoint
@app.get("/sensor-data")
async def get_sensor_data():
    left, right = get_latest_arduino_data()
    return {
        "left": left,
        "right": right,
        "status": "success"
    }

# Health check endpoint
@app.get("/")
async def root():
    return {
        "status": "running",
        "arduino_connected": arduino is not None,
        "arduino_waiting": arduino.in_waiting if arduino else 0
    }

if __name__ == "__main__":
    print("🚀 Starting server on http://localhost:8000")
    uvicorn.run(app, host="127.0.0.1", port=8000)
