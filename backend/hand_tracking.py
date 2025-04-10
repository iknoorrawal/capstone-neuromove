import argparse
import cv2
import mediapipe as mp
import time
import random
import math
import numpy as np
from config import calculate_score  # Remove the dot
import pygame  # Add pygame for sound handling
import os  # Add os for path handling

# Initialize pygame mixer for sound playback
pygame.mixer.init()

# Load sound files - assuming they are in frontend/public/sounds directory
# Use os.path.join for cross-platform compatibility
script_dir = os.path.dirname(os.path.abspath(__file__))
sound_path = os.path.join(script_dir, "sounds")

try:
    correct_sound = pygame.mixer.Sound(os.path.join(sound_path, "correct.mp3"))
    incorrect_sound = pygame.mixer.Sound(os.path.join(sound_path, "incorrect.mp3"))
    print("Sound files loaded successfully")
except Exception as e:
    print(f"Failed to load sound files: {e}")
    # Fallback to None so we can check if sounds are available
    correct_sound = None
    incorrect_sound = None

# Parse command-line arguments
parser = argparse.ArgumentParser()
parser.add_argument("numbers", type=str, help="Space-separated list of numbers to find")
parser.add_argument("config", type=str, help="Space-separated total_bubbles max_range level")
args = parser.parse_args()

# Convert space-separated strings to appropriate types
target_numbers = list(map(int, args.numbers.split()))
total_bubbles, max_range, level = map(int, args.config.split())  # Parse level from config

# Initialize MediaPipe Hands and Drawing utilities
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils

# Start capturing video
cap = cv2.VideoCapture(0)

# Create window and set it to fullscreen
cv2.namedWindow('Hand Tracking Game', cv2.WINDOW_NORMAL)

# Get the screen dimensions
screen_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
screen_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

# Adjust window size to match screen dimensions
cv2.resizeWindow('Hand Tracking Game', screen_width, screen_height)

# Countdown variables
start_time = time.time()  # Start the timer
countdown_duration = 5  # Countdown duration in seconds
recorded = False  # Flag to indicate if data has been recorded
game_started = False  # Flag to start the game logic

# Game state variables
correct_count = 0
incorrect_count = 0
found_numbers = set()  # Track which numbers have been found
touched_circles = {}  # Change to dictionary to store timestamps for touched circles
touch_cooldown = 1.0  # Cooldown in seconds before a circle can be counted again
game_end_time = None  # Track when game completion starts
end_game_delay = 3.0  # Seconds to show final screen

# Game configuration
num_points = total_bubbles  # Total number of bubbles to display
required_correct = len(target_numbers)  # Number of correct selections needed

# Initialize variables
left_hand_coord = None
right_hand_coord = None
wingspan = 0  # Wingspan value to store
additional_circles = []
circle_radius = 70  # Circle size increased
screen_margin = 120  # Prevent circles from touching screen edges

# Colors
circle_bg_color = (154, 105, 247)  # F7699A in BGR
text_color = (255, 255, 255)  # White
try_again_bg = (0, 0, 255)  # Red background
correct_bg = (0, 255, 0)  # Green background

# Add at the top with other game state variables
game_start_time = None  # To track when gameplay actually starts

# Add at top with other constants
INITIAL_INSTRUCTION = "1. Step back until your full wingspan is in the view\n2. Extend arms outward"
INITIAL_WAIT_TIME = 20 
INSTRUCTION_BG_COLOR = (129, 112, 243)  # F37081 in BGR format
COUNTDOWN_COLOR = (129, 112, 243)  

# Add with other state variables
initial_instruction_shown = False
initial_start_time = time.time()

# Add these constants at the top
HOLD_DURATION = 1.5  # Changed from 3.0 to 1.5 seconds
HOLD_COLOR = (255, 165, 0)  # Orange color
HOLD_THICKNESS = 4  # Increased thickness for better visibility

# Add to game state variables
circle_hold_start = {}  # Track when finger started touching each circle

# Add at top with other constants
GAMEPLAY_INSTRUCTION = "Hold to select correct bubble"

# Function to draw rounded rectangle
def draw_rounded_rectangle(img, x, y, w, h, radius, color, thickness=-1):
    # Draw the main rectangle
    img = cv2.rectangle(img, (x + radius, y), (x + w - radius, y + h), color, thickness)
    img = cv2.rectangle(img, (x, y + radius), (x + w, y + h - radius), color, thickness)
    
    # Draw the corner circles
    img = cv2.circle(img, (x + radius, y + radius), radius, color, thickness)
    img = cv2.circle(img, (x + w - radius, y + radius), radius, color, thickness)
    img = cv2.circle(img, (x + radius, y + h - radius), radius, color, thickness)
    img = cv2.circle(img, (x + w - radius, y + h - radius), radius, color, thickness)
    return img

# Function to draw stick figure
def draw_stick_figure(img, center_x, center_y, size=100, color=(255, 255, 255), thickness=3):
    # Head
    head_radius = size // 8
    cv2.circle(img, (center_x, center_y - size//2 + head_radius), head_radius, color, thickness)
    
    # Body
    body_top = center_y - size//2 + head_radius*2
    body_bottom = body_top + size//2
    cv2.line(img, (center_x, body_top), (center_x, body_bottom), color, thickness)
    
    # Arms (horizontal line for T-pose)
    arm_y = body_top + size//6
    arm_length = size//1.5
    cv2.line(img, 
             (int(center_x - arm_length/2), arm_y), 
             (int(center_x + arm_length/2), arm_y), 
             color, thickness)
    
    # Legs
    leg_length = size//3
    cv2.line(img, (center_x, body_bottom), 
             (center_x - leg_length//2, body_bottom + leg_length), color, thickness)
    cv2.line(img, (center_x, body_bottom), 
             (center_x + leg_length//2, body_bottom + leg_length), color, thickness)

# Initialize MediaPipe Hands
with mp_hands.Hands(
        static_image_mode=False,
        max_num_hands=2,
        min_detection_confidence=0.7,
        min_tracking_confidence=0.7) as hands:

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            print("Failed to grab frame")
            break

        # Get current time at start of loop
        current_time = time.time()

        # Flip the frame to un-mirror it
        frame = cv2.flip(frame, 1)

        # Convert to RGB for MediaPipe
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = hands.process(frame_rgb)

        # Show initial instruction with countdown
        if not initial_instruction_shown:
            # Calculate remaining time
            elapsed_time = time.time() - initial_start_time
            countdown = max(0, INITIAL_WAIT_TIME - int(elapsed_time))
            
            font = cv2.FONT_HERSHEY_SIMPLEX
            instruction_scale = 1.2
            countdown_scale = 1.5
            thickness = 2
            
            # Split instructions into two lines
            instructions = INITIAL_INSTRUCTION.split('\n')
            
            # Calculate text sizes
            text_sizes = [cv2.getTextSize(instr, font, instruction_scale, thickness)[0] for instr in instructions]
            max_width = max(size[0] for size in text_sizes)
            
            # Calculate available height using screen_margin
            available_height = frame.shape[0] - (2 * screen_margin)  # Total height minus top and bottom margins
            
            # Calculate positions for both lines
            padding_x = 40
            padding_y = 35
            rect_height = 70
            spacing = 40  # Space between instruction rectangles
            
            # Calculate heights of all elements
            instructions_height = (rect_height * 2) + spacing  # Two instruction boxes + spacing
            countdown_height = 100  # Height for countdown number
            figure_size = 100  # Stick figure size
            
            # Calculate total content height
            total_content_height = instructions_height + countdown_height + figure_size
            
            # Calculate spacing between major elements
            element_spacing = (available_height - total_content_height) // 3
            
            # Calculate starting Y position for instructions (using screen_margin)
            start_y = screen_margin + element_spacing
            
            # Draw instructions
            for i, (instruction, text_size) in enumerate(zip(instructions, text_sizes)):
                rect_width = text_size[0] + (padding_x * 2)
                rect_x = (frame.shape[1] - rect_width) // 2
                rect_y = start_y + (i * (rect_height + spacing))
                
                # Draw rounded rectangle background
                draw_rounded_rectangle(frame, 
                                    rect_x, rect_y,
                                    rect_width, rect_height,
                                    15,
                                    INSTRUCTION_BG_COLOR,
                                    -1)
                
                # Calculate text position
                text_x = rect_x + padding_x
                text_height = text_size[1]
                text_y = rect_y + (rect_height + text_height) // 2
                
                # Draw text
                cv2.putText(frame, instruction,
                           (text_x, text_y),
                           font, instruction_scale,
                           (255, 255, 255),
                           thickness)
            
            # Calculate positions for countdown and stick figure
            countdown_y = start_y + instructions_height + element_spacing + countdown_height//2
            figure_y = countdown_y + countdown_height//2 + element_spacing
            
            # Draw countdown number with larger size and shadow effect
            countdown_text = str(countdown)
            countdown_scale = 1.5  # Keep the same scale
            
            # Calculate progress for the circle (from 0 to 1)
            progress = countdown / INITIAL_WAIT_TIME
            
            # Calculate center position for the countdown
            center_x = frame.shape[1] // 2
            circle_radius = 45  # Keep the circle size the same
            
            # Draw outer circle (background)
            cv2.circle(frame, (center_x, countdown_y), circle_radius, (200, 200, 200), 3)
            
            # Draw progress arc using the same pink color as text background
            if progress > 0:
                end_angle = 360 * progress
                cv2.ellipse(frame, 
                          (center_x, countdown_y), 
                          (circle_radius, circle_radius),
                          -90,  # Start from top
                          0, end_angle,
                          INSTRUCTION_BG_COLOR,  # Use same pink color as text background
                          3)
            
            # Calculate exact text position for perfect centering
            (text_width, text_height), baseline = cv2.getTextSize(countdown_text, cv2.FONT_HERSHEY_SIMPLEX, countdown_scale, 3)
            text_x = center_x - text_width // 2
            # Adjust Y position to center vertically within the circle
            text_y = countdown_y + (text_height - baseline) // 3
            
            # Draw the number with increased thickness
            cv2.putText(frame, countdown_text,
                       (text_x, text_y),
                       cv2.FONT_HERSHEY_SIMPLEX,
                       countdown_scale,
                       COUNTDOWN_COLOR,  # Changed from (0, 0, 0) to COUNTDOWN_COLOR
                       3)  # Increased thickness from 2 to 3
            
            # Draw stick figure
            figure_x = frame.shape[1] // 2
            draw_stick_figure(frame, figure_x, figure_y, figure_size)
            
            if countdown == 0:
                initial_instruction_shown = True
                start_time = time.time()  # Reset timer for main game
                game_start_time = time.time()  # Set game start time
                game_started = True  # Start the game immediately after countdown
        else:
            # score display in the corner
            cv2.putText(frame, f"Correct: {correct_count}", (10, 30), 
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            cv2.putText(frame, f"Incorrect: {incorrect_count}", (10, 70), 
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
            
            # Only show gameplay instruction when game has started
            if game_started:
                # Get the text size to calculate centering
                (text_width, text_height), _ = cv2.getTextSize(GAMEPLAY_INSTRUCTION, cv2.FONT_HERSHEY_SIMPLEX, 2, 3)
                # Calculate X position to center the text
                x_center = (frame.shape[1] - text_width) // 2
                y_position = 50  # Keep the Y position after scores
                # Add the instruction text in a larger size and centered
                cv2.putText(frame, GAMEPLAY_INSTRUCTION, (x_center, y_position),
                          cv2.FONT_HERSHEY_SIMPLEX, 1.5, (255, 255, 255), 3)

            # Measure wingspan
            if results.multi_hand_landmarks and wingspan == 0:
                # Reset coordinates each time to avoid stale values
                left_hand_coord = None
                right_hand_coord = None
                
                # Get all hand landmarks first
                hand_positions = []
                for hand_landmarks in results.multi_hand_landmarks:
                    index_finger_tip = hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP]
                    x, y = int(index_finger_tip.x * frame.shape[1]), int(index_finger_tip.y * frame.shape[0])
                    hand_positions.append((x, y))
                
                # Sort by x-coordinate to determine left and right hands
                if len(hand_positions) == 2:
                    sorted_hands = sorted(hand_positions, key=lambda pos: pos[0])
                    left_hand_coord = sorted_hands[0]
                    right_hand_coord = sorted_hands[1]
                    
                    # Calculate wingspan
                    dx = right_hand_coord[0] - left_hand_coord[0]
                    dy = right_hand_coord[1] - left_hand_coord[1]
                    new_wingspan = math.sqrt(dx**2 + dy**2)
                    
                    # Only set wingspan if it's a reasonable value
                    if new_wingspan > 100:  # Minimum reasonable wingspan
                        wingspan = new_wingspan

            # circles after countdown ends and already not placed and valid wingspan
            if game_started and not recorded and wingspan > 0:  # Changed condition from countdown == 1
                radius = min(wingspan / 2, frame.shape[1] * 0.4)  # Increased from /3 to *0.4 (2/5 of screen width)
                
                # Calculate center point
                center_x = frame.shape[1] // 2  # Use screen center instead of hand midpoint
                center_y = frame.shape[0] // 2
                
                # Start with target numbers and add random ones until we reach total_bubbles
                numbers_to_display = target_numbers.copy()
                while len(numbers_to_display) < total_bubbles:
                    rand_num = random.randint(1, max_range)
                    if rand_num not in numbers_to_display:
                        numbers_to_display.append(rand_num)
                random.shuffle(numbers_to_display)

                # Arrange circles in a circle
                angle_step = 2 * math.pi / num_points
                additional_circles.clear()
                for i in range(num_points):
                    angle = i * angle_step
                    circle_x = int(center_x + radius * math.cos(angle))
                    circle_y = int(center_y + radius * math.sin(angle))

                    # Keep circles within frame considering the margin
                    circle_x = max(screen_margin, min(frame.shape[1] - screen_margin, circle_x))
                    circle_y = max(screen_margin, min(frame.shape[0] - screen_margin, circle_y))

                    additional_circles.append({
                        "x": circle_x,
                        "y": circle_y,
                        "number": numbers_to_display[i],
                        "visible": True,
                        "timestamp": None,
                        "message": None,
                        "message_bg": None,
                        "try_again_timestamp": None
                    })
                
                recorded = True

            # Draw additional game circles and their messages
            if game_started:
                for circle in additional_circles:
                    if circle["visible"]:
                        # Draw the circle
                        cv2.circle(frame, (circle["x"], circle["y"]), circle_radius, circle_bg_color, -1)

                        # Draw the number in white
                        text = str(circle["number"])
                        text_scale = 1.5
                        text_thickness = 4
                        text_size = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, text_scale, text_thickness)[0]
                        text_x = circle["x"] - text_size[0] // 2
                        text_y = circle["y"] + text_size[1] // 2
                        cv2.putText(frame, text, (text_x, text_y), cv2.FONT_HERSHEY_SIMPLEX, text_scale, text_color, text_thickness)

                        # Draw "Correct!" message if exists
                        if circle["message"] and circle["timestamp"]:
                            if current_time - circle["timestamp"] <= 2:
                                cv2.rectangle(frame, (circle["x"] - 100, circle["y"] - 150),
                                           (circle["x"] + 100, circle["y"] - 100), circle["message_bg"], -1)
                                cv2.putText(frame, circle["message"], (circle["x"] - 80, circle["y"] - 115),
                                         cv2.FONT_HERSHEY_SIMPLEX, 1, text_color, 2)
                        
                        # Draw "Try Again" message if exists (only message, not bubble)
                        if circle["try_again_timestamp"]:
                            if current_time - circle["try_again_timestamp"] <= 1:
                                cv2.rectangle(frame, (circle["x"] - 100, circle["y"] - 150),
                                           (circle["x"] + 100, circle["y"] - 100), try_again_bg, -1)
                                cv2.putText(frame, "Try Again", (circle["x"] - 80, circle["y"] - 115),
                                         cv2.FONT_HERSHEY_SIMPLEX, 1, text_color, 2)
                            else:
                                circle["try_again_timestamp"] = None  # Only reset the message timestamp

            # Detect fingertip interaction
            if results.multi_hand_landmarks and game_started:
                # Track all index fingertips
                index_fingertips = []
                for hand_landmarks in results.multi_hand_landmarks:
                    # Draw hand landmarks
                    mp_drawing.draw_landmarks(
                        frame,
                        hand_landmarks,
                        mp_hands.HAND_CONNECTIONS,
                        mp_drawing.DrawingSpec(color=(0, 0, 255), thickness=2, circle_radius=5),
                        mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=2)
                    )

                    # Get index fingertip position
                    index_finger_tip = hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP]
                    x, y = int(index_finger_tip.x * frame.shape[1]), int(index_finger_tip.y * frame.shape[0])
                    index_fingertips.append((x, y))

                # Check each circle against all fingertips
                for circle in additional_circles:
                    if circle["visible"]:
                        circle_id = f"{circle['x']}_{circle['y']}"
                        
                        # Check if any fingertip is touching this circle
                        for x, y in index_fingertips:
                            distance = math.sqrt((circle["x"] - x)**2 + (circle["y"] - y)**2)
                            
                            if distance < circle_radius:
                                # Start or continue holding
                                if circle_id not in circle_hold_start:
                                    circle_hold_start[circle_id] = current_time
                                
                                # Calculate hold progress
                                hold_time = current_time - circle_hold_start[circle_id]
                                if hold_time < HOLD_DURATION:
                                    # Draw hold progress
                                    progress = hold_time / HOLD_DURATION
                                    # Draw outer progress circle
                                    cv2.circle(frame, (circle["x"], circle["y"]), 
                                             circle_radius, 
                                             HOLD_COLOR, 
                                             HOLD_THICKNESS)
                                    # Draw progress arc
                                    end_angle = 360 * progress
                                    cv2.ellipse(frame, 
                                              (circle["x"], circle["y"]), 
                                              (circle_radius, circle_radius),
                                              0, 0, end_angle,
                                              (0, 255, 0),
                                              HOLD_THICKNESS)
                                else:
                                    # Hold duration met - process selection
                                    if circle["number"] in target_numbers and circle["number"] not in found_numbers:
                                        correct_count += 1
                                        found_numbers.add(circle["number"])
                                        circle["timestamp"] = current_time
                                        circle["message"] = "Correct!"
                                        circle["message_bg"] = correct_bg
                                        circle["visible"] = False
                                        
                                        # Play correct sound
                                        if correct_sound:
                                            correct_sound.play()
                                            
                                    elif (circle["number"] not in found_numbers and 
                                          (circle_id not in touched_circles or 
                                           current_time - touched_circles.get(circle_id, 0) > touch_cooldown)):
                                        incorrect_count += 1
                                        touched_circles[circle_id] = current_time
                                        circle["try_again_timestamp"] = current_time
                                        
                                        # Play incorrect sound
                                        if incorrect_sound:
                                            incorrect_sound.play()
                                    
                                    # Reset hold timer after processing
                                    circle_hold_start.pop(circle_id, None)
                                break  # Exit the fingertip loop once we've found a touching finger
                            else:
                                # Only reset hold timer if no fingertip is touching
                                if all(math.sqrt((circle["x"] - fx)**2 + (circle["y"] - fy)**2) >= circle_radius 
                                      for fx, fy in index_fingertips):
                                    circle_hold_start.pop(circle_id, None)

            # Clean up hold timers for circles no longer being touched
            current_circles = {f"{circle['x']}_{circle['y']}" for circle in additional_circles if circle["visible"]}
            circle_hold_start = {k: v for k, v in circle_hold_start.items() if k in current_circles}

            # Draw messages
            for circle in additional_circles:
                if circle["message"] and circle["timestamp"] and current_time - circle["timestamp"] <= 2:
                    cv2.rectangle(frame, (circle["x"] - 100, circle["y"] - 150),
                               (circle["x"] + 100, circle["y"] - 100), circle["message_bg"], -1)
                    cv2.putText(frame, circle["message"], (circle["x"] - 80, circle["y"] - 115),
                             cv2.FONT_HERSHEY_SIMPLEX, 1, text_color, 2)
                
                if circle["try_again_timestamp"] and current_time - circle["try_again_timestamp"] <= 1:
                    cv2.rectangle(frame, (circle["x"] - 100, circle["y"] - 150),
                               (circle["x"] + 100, circle["y"] - 100), try_again_bg, -1)
                    cv2.putText(frame, "Try Again", (circle["x"] - 80, circle["y"] - 115),
                             cv2.FONT_HERSHEY_SIMPLEX, 1, text_color, 2)

        # Check for game completion BEFORE regular frame display
        if correct_count >= required_correct:
            if game_end_time is None:
                game_end_time = current_time
                game_duration = round(game_end_time - game_start_time, 2)
                score = calculate_score(incorrect_count, level)
                print(f"\nGame Complete!\nCorrect Selections: {correct_count}\nIncorrect Attempts: {incorrect_count}\nDuration: {game_duration}\nScore: {score}")
            
            # Create completion frame
            completion_frame = frame.copy()
            height, width = completion_frame.shape[:2]
            
            # Create dark overlay
            overlay = np.zeros((height, width, 3), dtype=np.uint8)
            cv2.addWeighted(overlay, 0.7, completion_frame, 0.3, 0, completion_frame)
            
            # Draw completion messages
            message = "Game Complete!"
            sub_message = "Go back to browser"
            
            # Main message
            font_scale = 2
            thickness = 3
            text_size = cv2.getTextSize(message, cv2.FONT_HERSHEY_SIMPLEX, font_scale, thickness)[0]
            text_x = (width - text_size[0]) // 2
            text_y = height // 2
            
            cv2.putText(completion_frame, message,
                      (text_x, text_y),
                      cv2.FONT_HERSHEY_SIMPLEX, font_scale, (255, 255, 255), thickness)
            
            # Sub message
            font_scale_sub = 1
            text_size_sub = cv2.getTextSize(sub_message, cv2.FONT_HERSHEY_SIMPLEX, font_scale_sub, thickness)[0]
            text_x_sub = (width - text_size_sub[0]) // 2
            
            cv2.putText(completion_frame, sub_message,
                      (text_x_sub, text_y + 50),
                      cv2.FONT_HERSHEY_SIMPLEX, font_scale_sub, (255, 255, 255), 2)
            
            # Show completion frame
            cv2.imshow('Hand Tracking Game', completion_frame)
            
            # Check if we should exit
            if current_time - game_end_time > 5.0:
                break
            
        else:
            # Show regular game frame if game not complete
            cv2.imshow('Hand Tracking Game', frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

# Clean up pygame resources before exiting
pygame.mixer.quit()

cap.release()
cv2.destroyAllWindows()
