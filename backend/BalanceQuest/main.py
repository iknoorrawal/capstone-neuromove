from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from game_logic import BalanceGame
from constants import Faces, Flags, Foods, Fruits, Animals, HandSymbols, Nature, Sports, Clothing
import random
from .constants import CATEGORIES

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create a game instance
game = BalanceGame()

LEVEL_CONFIG = {
    1: {"items": 10, "memorizeTime": 10, "guessTime": 15},
    2: {"items": 12, "memorizeTime": 10, "guessTime": 10},
    3: {"items": 15, "memorizeTime": 10, "guessTime": 5}
}

@app.get("/game")
async def get_game_data(level: int = Query(default=1, ge=1, le=3)):
    # Get level configuration
    config = LEVEL_CONFIG.get(level, LEVEL_CONFIG[1])
    num_items = config["items"]

    # List of all available categories
    categories = [Faces, Flags, Foods, Fruits, Animals, HandSymbols, Nature, Sports, Clothing]
    
    # Randomly select a category
    selected_category = random.choice(categories)
    
    # Always select exactly 3 items from the category for initial display
    initial_items = random.sample(selected_category, 3)
    
    # Create a pool of items for guessing
    guess_pool = []
    
    # Add some items from the same category
    remaining_category_items = [item for item in selected_category if item not in initial_items]
    num_same_category = num_items // 2
    if remaining_category_items:
        guess_pool.extend([
            {"emoji": item, "inGroup": True}
            for item in random.sample(remaining_category_items, min(num_same_category, len(remaining_category_items)))
        ])
    
    # Add items from other categories
    other_categories = [cat for cat in categories if cat != selected_category]
    other_items = []
    for cat in other_categories:
        other_items.extend(cat)
    
    num_other_category = num_items - len(guess_pool)
    guess_pool.extend([
        {"emoji": item, "inGroup": False}
        for item in random.sample(other_items, num_other_category)
    ])
    
    # Shuffle the guess pool
    random.shuffle(guess_pool)
    
    return {
        "initialEmojis": [{"emoji": item} for item in initial_items],
        "guessEmojis": guess_pool
    }

@app.get("/game/state")
async def get_game_state():
    return game.get_game_state()

@app.post("/game/check")
async def check_answer(left_sensor: int, right_sensor: int):
    result = game.check_answer(bool(left_sensor), bool(right_sensor))
    return result

@app.post("/game/reset")
async def reset_game():
    game.reset_game()
    return game.get_game_state() 