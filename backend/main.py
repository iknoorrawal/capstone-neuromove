import random
import subprocess
from fastapi import Body, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from BalanceQuest.constants import Faces, Flags, Foods, Fruits, Animals, HandSymbols, Nature, Sports, Clothing
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
async def get_game_data():
    """
    Returns a JSON object containing:
      - 3 initial emojis from one randomly chosen category (unknown to the frontend).
      - 10 emojis to guess from (some from the chosen category, some from others),
        each labeled with inGroup = True or False.
    """
    category_name = random.choice(list(CATEGORIES.keys()))
    category_emojis = CATEGORIES[category_name]
    initial_emojis = random.sample(category_emojis, 3)
    in_group_count = random.randint(3, 4)

    remaining_in_category = [x for x in category_emojis if x not in initial_emojis]
    in_group_emojis = random.sample(remaining_in_category, in_group_count)

    other_categories_emojis = []
    for cat, emojis in CATEGORIES.items():
        if cat != category_name:
            other_categories_emojis.extend(emojis)

    out_group_count = 10 - in_group_count
    out_group_emojis = random.sample(other_categories_emojis, out_group_count)

    guess_emojis_raw = in_group_emojis + out_group_emojis
    random.shuffle(guess_emojis_raw)

    guess_emojis = []
    for (name, emoji) in guess_emojis_raw:
        # If (name, emoji) is in in_group_emojis, it's in the same category
        in_group_flag = (name, emoji) in in_group_emojis
        guess_emojis.append({
            "name": name,
            "emoji": emoji,
            "inGroup": in_group_flag
        })

    initial_emojis_data = [{"name": name, "emoji": emoji} for (name, emoji) in initial_emojis]

    return {
        "initialEmojis": initial_emojis_data,
        "guessEmojis": guess_emojis
    }
