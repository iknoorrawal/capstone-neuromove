GAME_CONFIG = {
    1: {
        "total_bubbles": 5,
        "correct_numbers": 2,
        "max_range": 20,
        "scoring_rules": [
            {"threshold": 0, "score": 500},
            {"threshold": 1, "score": 400},
            {"threshold": 3, "score": 300},
            {"threshold": 9, "score": 200},
            {"threshold": float('inf'), "score": 100}
        ]
    },
    2: {
        "total_bubbles": 8,
        "correct_numbers": 3,
        "max_range": 50,
        "scoring_rules": [
            {"threshold": 0, "score": 500},
            {"threshold": 3, "score": 400},
            {"threshold": 6, "score": 300},
            {"threshold": 10, "score": 200},
            {"threshold": 15, "score": 100},
            {"threshold": float('inf'), "score": 50}
        ]
    },
    3: {
        "total_bubbles": 10,
        "correct_numbers": 4,
        "max_range": 100,
        "scoring_rules": [
            {"threshold": 0, "score": 500},
            {"threshold": 5, "score": 400},
            {"threshold": 10, "score": 300},
            {"threshold": 15, "score": 200},
            {"threshold": 20, "score": 100},
            {"threshold": float('inf'), "score": 50}
        ]
    }
}

def get_level_config(level):
    return GAME_CONFIG.get(level, GAME_CONFIG[1])

def calculate_score(incorrect_count, level):
    config = get_level_config(level)
    rules = config["scoring_rules"]
    
    for rule in rules:
        if incorrect_count <= rule["threshold"]:
            return rule["score"]
    return rules[-1]["score"] 