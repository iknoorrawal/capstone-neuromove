import random
import subprocess
from fastapi import Body, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import get_level_config

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

