import random
from constants import Flags, Sports, Clothing, Fruits, Animals, Nature, Foods, HandSymbols, Faces

class BalanceGame:
    def __init__(self):
        # Create a dictionary of categories with only the emojis (second part of tuples)
        self.categories = {
            "Flags": [emoji for _, emoji in Flags],
            "Sports": [emoji for _, emoji in Sports],
            "Clothing": [emoji for _, emoji in Clothing],
            "Fruits": [emoji for _, emoji in Fruits],
            "Animals": [emoji for _, emoji in Animals],
            "Nature": [emoji for _, emoji in Nature],
            "Foods": [emoji for _, emoji in Foods],
            "Hand Symbols": [emoji for _, emoji in HandSymbols],
            "Faces": [emoji for _, emoji in Faces]
        }
        self.reset_game()
    
    def reset_game(self):
        # Pick a random category
        self.current_category = random.choice(list(self.categories.keys()))
        category_emojis = self.categories[self.current_category]
        
        # Get 3 random emojis for reference
        self.reference_emojis = random.sample(category_emojis, 3)
        
        # Create a list of test emojis that excludes the reference emojis
        available_category_emojis = [e for e in category_emojis if e not in self.reference_emojis]
        
        # Get emojis from other categories
        other_categories = [cat for cat in self.categories.keys() if cat != self.current_category]
        other_emojis = []
        for cat in other_categories:
            other_emojis.extend(self.categories[cat])
        
        # Create test set with 50/50 split between in/out of category
        num_test_items = 10  # or whatever number you want to test
        num_in_category = num_test_items // 2
        
        in_category_tests = random.sample(available_category_emojis, num_in_category)
        out_category_tests = random.sample(other_emojis, num_test_items - num_in_category)
        
        # Combine and shuffle the test emojis
        self.test_emojis = []
        for emoji in in_category_tests:
            self.test_emojis.append({"emoji": emoji, "inGroup": True})
        for emoji in out_category_tests:
            self.test_emojis.append({"emoji": emoji, "inGroup": False})
        random.shuffle(self.test_emojis)

    def get_game_state(self):
        return {
            "category": self.current_category,
            "initialEmojis": [{"emoji": e} for e in self.reference_emojis],
            "guessEmojis": self.test_emojis
        } 