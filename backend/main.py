import random
import subprocess
from fastapi import Body, FastAPI
from fastapi.middleware.cors import CORSMiddleware

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

@app.post("/run-script")
async def run_script(numbers: dict = Body(...)):
    try:
        if game_state.process is None:
            numbers_list = numbers.get("numbers", [])  # Get array of numbers
            level = numbers.get("level", 1)  # Default to level 1
            
            # Convert numbers list to space-separated string
            numbers_arg = ' '.join(map(str, numbers_list))
            
            process = subprocess.Popen(
                ["python", "hand_tracking.py", numbers_arg, str(level)],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            game_state.process = process
            return {"status": "started"}
            
        # Subsequent calls - check if game has finished
        if game_state.process is not None:
            # Quick check if process has ended
            if game_state.process.poll() is not None:
                # Process ended, let's get the output
                stdout, stderr = game_state.process.communicate()
                
                # Parse the scores from the printed output
                scores = {"correct": 0, "incorrect": 0, "duration": 0}
                for line in stdout.split('\n'):
                    if "Correct Selections:" in line:
                        scores["correct"] = int(line.split(":")[1].strip())
                    elif "Incorrect Attempts:" in line:
                        scores["incorrect"] = int(line.split(":")[1].strip())
                    elif "Duration:" in line:
                        scores["duration"] = float(line.split(":")[1].strip())
                
                game_state.process = None  # Reset for next game
                return {
                    "status": "complete",
                    "scores": scores
                }
            
            # Process still running
            return {"status": "running"}
            
    except Exception as e:
        if game_state.process:
            game_state.process = None
        return {"status": "error", "error": str(e)}

@app.get("/get-number")
async def generate_random_number():
    number1 = random.randint(1, 20)
    number2 = random.randint(1, 20)
    return {"number1": number1, "number2": number2}

