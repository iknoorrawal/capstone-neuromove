export const GAME_CONFIG = {
    1: {
        totalBubbles: 5,
        correctNumbers: 2,
        maxRange: 20,
        scoringRules: [
            {threshold: 0, score: 500},  // 0 incorrect
            {threshold: 1, score: 400},  // 1 incorrect
            {threshold: 3, score: 300},  // 2-3 incorrect
            {threshold: 9, score: 200},  // 4-9 incorrect
            {threshold: Infinity, score: 100}  // 10+ incorrect
        ]
    },
    2: {
        totalBubbles: 8,
        correctNumbers: 3,
        maxRange: 50,
        scoringRules: [
            {threshold: 0, score: 500},  // 0 incorrect
            {threshold: 3, score: 400},  // 1-3 incorrect
            {threshold: 6, score: 300},  // 4-6 incorrect
            {threshold: 10, score: 200}, // 7-10 incorrect
            {threshold: 15, score: 100}, // 11-15 incorrect
            {threshold: Infinity, score: 50}  // 15+ incorrect
        ]
    },
    3: {
        totalBubbles: 10,
        correctNumbers: 4,
        maxRange: 100,
        scoringRules: [
            {threshold: 0, score: 500},  // 0 incorrect
            {threshold: 5, score: 400},  // 1-5 incorrect
            {threshold: 10, score: 300}, // 6-10 incorrect
            {threshold: 15, score: 200}, // 11-15 incorrect
            {threshold: 20, score: 100}, // 16-20 incorrect
            {threshold: Infinity, score: 50}  // 20+ incorrect
        ]
    }
};

export const calculateScore = (incorrect, level) => {
    const config = GAME_CONFIG[level] || GAME_CONFIG[1];
    const rules = config.scoringRules;
    
    for (const rule of rules) {
        if (incorrect <= rule.threshold) {
            return rule.score;
        }
    }
    return rules[rules.length - 1].score;
}; 