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
        # If game is not running, start it
        if game_state.process is None:
            number1 = numbers.get("number1")
            number2 = numbers.get("number2")
            
            process = subprocess.Popen(
                ["python", "hand_tracking.py", str(number1), str(number2)],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            game_state.process = process
            return {"status": "started"}
            
        # If game is running, check if it's completed
        if game_state.process is not None:
            # Check if process has ended
            if game_state.process.poll() is not None:
                stdout, stderr = game_state.process.communicate()
                
                # Parse scores from output
                scores = {"correct": 0, "incorrect": 0}
                for line in stdout.split('\n'):
                    if "Correct Selections:" in line:
                        scores["correct"] = int(line.split(":")[1].strip())
                    elif "Incorrect Attempts:" in line:
                        scores["incorrect"] = int(line.split(":")[1].strip())
                
                game_state.process = None  # Reset the process
                return {
                    "status": "complete",
                    "scores": scores
                }
            
            # Process is still running
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

