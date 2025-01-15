
# import argparse
# import cv2
# import mediapipe as mp
# import time
# import random
# import math

# # Parse command-line arguments
# parser = argparse.ArgumentParser()
# parser.add_argument("number1", type=int, help="First number to display")
# parser.add_argument("number2", type=int, help="Second number to display")
# args = parser.parse_args()

# number1 = args.number1
# number2 = args.number2

# # Initialize MediaPipe Hands and Drawing utilities
# mp_hands = mp.solutions.hands
# mp_drawing = mp.solutions.drawing_utils

# # Start capturing video
# cap = cv2.VideoCapture(0)

# # Countdown variables
# start_time = time.time()  # Start the timer
# countdown_duration = 5  # Countdown duration in seconds
# recorded = False  # Flag to indicate if data has been recorded
# game_started = False  # Flag to start the game logic

# # Initialize variables
# left_hand_coord = None
# right_hand_coord = None
# wingspan = 0  # Wingspan value to store
# additional_circles = []
# circle_radius = 70  # Circle size increased
# screen_margin = 120  # Prevent circles from touching screen edges

# # Colors
# circle_bg_color = (154, 105, 247)  # F7699A in BGR
# text_color = (255, 255, 255)  # White
# try_again_bg = (0, 0, 255)  # Red background
# correct_bg = (0, 255, 0)  # Green background

# # Initialize MediaPipe Hands
# with mp_hands.Hands(
#         static_image_mode=False,
#         max_num_hands=2,
#         min_detection_confidence=0.7,
#         min_tracking_confidence=0.7) as hands:

#     while cap.isOpened():
#         ret, frame = cap.read()
#         if not ret:
#             print("Failed to grab frame")
#             break

#         # Flip the frame to un-mirror it
#         frame = cv2.flip(frame, 1)

#         # Convert to RGB for MediaPipe
#         frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
#         results = hands.process(frame_rgb)

#         # Countdown logic
#         elapsed_time = time.time() - start_time
#         countdown = max(0, countdown_duration - int(elapsed_time))  # Countdown value

#         if countdown > 0:
#             # Display the countdown on the screen
#             cv2.putText(frame, f"{countdown}", (frame.shape[1] // 2 - 50, frame.shape[0] // 2),
#                         cv2.FONT_HERSHEY_SIMPLEX, 4, (0, 255, 255), 6)

#         # Measure wingspan
#         if results.multi_hand_landmarks and wingspan == 0:
#             for idx, hand_landmarks in enumerate(results.multi_hand_landmarks):
#                 # Extract index finger tip coordinates
#                 index_finger_tip = hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP]
#                 x, y = int(index_finger_tip.x * frame.shape[1]), int(index_finger_tip.y * frame.shape[0])

#                 # Assign left and right fingertip coordinates
#                 if idx == 0:
#                     left_hand_coord = (x, y)
#                 elif idx == 1:
#                     right_hand_coord = (x, y)

#             # Calculate wingspan
#             if left_hand_coord and right_hand_coord:
#                 dx = right_hand_coord[0] - left_hand_coord[0]
#                 dy = right_hand_coord[1] - left_hand_coord[1]
#                 wingspan = math.sqrt(dx**2 + dy**2)
#                 print(f"Measured Wingspan: {wingspan}")

#         # Generate circles after countdown ends
#         if countdown == 1 and not recorded and wingspan > 0:
#             # Calculate radius and center
#             radius = wingspan / 2
#             center_x = (left_hand_coord[0] + right_hand_coord[0]) // 2
#             center_y = (left_hand_coord[1] + right_hand_coord[1]) // 2

#             # Ensure both correct numbers are included
#             numbers_to_display = [number1, number2]
#             while len(numbers_to_display) < 5:
#                 rand_num = random.randint(1, 20)
#                 if rand_num not in numbers_to_display:
#                     numbers_to_display.append(rand_num)
#             random.shuffle(numbers_to_display)

#             # Arrange circles in a circle
#             num_points = 5
#             angle_step = 2 * math.pi / num_points
#             additional_circles.clear()
#             for i in range(num_points):
#                 angle = i * angle_step
#                 circle_x = int(center_x + radius * math.cos(angle))
#                 circle_y = int(center_y + radius * math.sin(angle))

#                 # Keep circles within frame considering the margin
#                 circle_x = max(screen_margin, min(frame.shape[1] - screen_margin, circle_x))
#                 circle_y = max(screen_margin, min(frame.shape[0] - screen_margin, circle_y))

#                 additional_circles.append({
#                     "x": circle_x,
#                     "y": circle_y,
#                     "number": numbers_to_display[i],
#                     "visible": True
#                 })

#             print("Generated Circles:", additional_circles)
#             recorded = True
#             game_started = True

#         # Draw additional game circles
#         if game_started:
#             for circle in additional_circles:
#                 if circle["visible"]:
#                     # Draw the circle
#                     cv2.circle(frame, (circle["x"], circle["y"]), circle_radius, circle_bg_color, -1)

#                     # Draw the number in white
#                     text = str(circle["number"])
#                     text_scale = 2
#                     text_thickness = 4
#                     text_size = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, text_scale, text_thickness)[0]
#                     text_x = circle["x"] - text_size[0] // 2
#                     text_y = circle["y"] + text_size[1] // 2
#                     cv2.putText(frame, text, (text_x, text_y), cv2.FONT_HERSHEY_SIMPLEX, text_scale, text_color, text_thickness)

#         # Detect fingertip interaction
#         if results.multi_hand_landmarks:
#             for hand_landmarks in results.multi_hand_landmarks:
#                 index_finger_tip = hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP]
#                 x, y = int(index_finger_tip.x * frame.shape[1]), int(index_finger_tip.y * frame.shape[0])

#                 for circle in additional_circles:
#                     if circle["visible"]:
#                         # Calculate distance between fingertip and circle
#                         distance = math.sqrt((circle["x"] - x)**2 + (circle["y"] - y)**2)
#                         if distance < circle_radius:
#                             if circle["number"] in [number1, number2]:
#                                 circle["visible"] = False
#                                 # Draw "Correct!" message
#                                 cv2.rectangle(frame, (circle["x"] - 100, circle["y"] - 150),
#                                               (circle["x"] + 100, circle["y"] - 100), correct_bg, -1)
#                                 cv2.putText(frame, "Correct!", (circle["x"] - 80, circle["y"] - 115),
#                                             cv2.FONT_HERSHEY_SIMPLEX, 1, text_color, 2)
#                             else:
#                                 # Draw "Try Again" message
#                                 cv2.rectangle(frame, (circle["x"] - 100, circle["y"] - 150),
#                                               (circle["x"] + 100, circle["y"] - 100), try_again_bg, -1)
#                                 cv2.putText(frame, "Try Again", (circle["x"] - 80, circle["y"] - 115),
#                                             cv2.FONT_HERSHEY_SIMPLEX, 1, text_color, 2)

#         # Show the frame
#         cv2.imshow('Hand Tracking Game', frame)
#         if cv2.waitKey(1) & 0xFF == ord('q'):
#             break

# cap.release()
# cv2.destroyAllWindows()


import argparse
import cv2
import mediapipe as mp
import time
import random
import math

# Parse command-line arguments
parser = argparse.ArgumentParser()
parser.add_argument("number1", type=int, help="First number to display")
parser.add_argument("number2", type=int, help="Second number to display")
args = parser.parse_args()

number1 = args.number1
number2 = args.number2

# Initialize MediaPipe Hands and Drawing utilities
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils

# Start capturing video
cap = cv2.VideoCapture(0)

# Countdown variables
start_time = time.time()  # Start the timer
countdown_duration = 5  # Countdown duration in seconds
recorded = False  # Flag to indicate if data has been recorded
game_started = False  # Flag to start the game logic

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

        # Flip the frame to un-mirror it
        frame = cv2.flip(frame, 1)

        # Convert to RGB for MediaPipe
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = hands.process(frame_rgb)

        # Countdown logic
        elapsed_time = time.time() - start_time
        countdown = max(0, countdown_duration - int(elapsed_time))  # Countdown value

        if countdown > 0:
            # Display the countdown on the screen
            cv2.putText(frame, f"{countdown}", (frame.shape[1] // 2 - 50, frame.shape[0] // 2),
                        cv2.FONT_HERSHEY_SIMPLEX, 4, (0, 255, 255), 6)

        # Measure wingspan
        if results.multi_hand_landmarks and wingspan == 0:
            for idx, hand_landmarks in enumerate(results.multi_hand_landmarks):
                # Extract index finger tip coordinates
                index_finger_tip = hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP]
                x, y = int(index_finger_tip.x * frame.shape[1]), int(index_finger_tip.y * frame.shape[0])

                # Assign left and right fingertip coordinates
                if idx == 0:
                    left_hand_coord = (x, y)
                elif idx == 1:
                    right_hand_coord = (x, y)

            # Calculate wingspan
            if left_hand_coord and right_hand_coord:
                dx = right_hand_coord[0] - left_hand_coord[0]
                dy = right_hand_coord[1] - left_hand_coord[1]
                wingspan = math.sqrt(dx**2 + dy**2)
                print(f"Measured Wingspan: {wingspan}")

        # Generate circles after countdown ends
        if countdown == 1 and not recorded and wingspan > 0:
            # Calculate radius and center
            radius = wingspan / 2
            center_x = (left_hand_coord[0] + right_hand_coord[0]) // 2
            center_y = (left_hand_coord[1] + right_hand_coord[1]) // 2

            # Ensure both correct numbers are included
            numbers_to_display = [number1, number2]
            while len(numbers_to_display) < 5:
                rand_num = random.randint(1, 20)
                if rand_num not in numbers_to_display:
                    numbers_to_display.append(rand_num)
            random.shuffle(numbers_to_display)

            # Arrange circles in a circle
            num_points = 5
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
                    "timestamp": None  # Add a timestamp key
                })

            print("Generated Circles:", additional_circles)
            recorded = True
            game_started = True

        # Draw additional game circles
        if game_started:
            for circle in additional_circles:
                if circle["visible"]:
                    # Draw the circle
                    cv2.circle(frame, (circle["x"], circle["y"]), circle_radius, circle_bg_color, -1)

                    # Draw the number in white
                    text = str(circle["number"])
                    text_scale = 2
                    text_thickness = 4
                    text_size = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, text_scale, text_thickness)[0]
                    text_x = circle["x"] - text_size[0] // 2
                    text_y = circle["y"] + text_size[1] // 2
                    cv2.putText(frame, text, (text_x, text_y), cv2.FONT_HERSHEY_SIMPLEX, text_scale, text_color, text_thickness)

        # Detect fingertip interaction
        current_time = time.time()
        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                # Draw hand landmarks
                mp_drawing.draw_landmarks(
                    frame,
                    hand_landmarks,
                    mp_hands.HAND_CONNECTIONS,
                    mp_drawing.DrawingSpec(color=(0, 0, 255), thickness=2, circle_radius=5),  # Red dots
                    mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=2)  # Green connections
                )

                index_finger_tip = hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP]
                x, y = int(index_finger_tip.x * frame.shape[1]), int(index_finger_tip.y * frame.shape[0])

                for circle in additional_circles:
                    if circle["visible"]:
                        # Calculate distance between fingertip and circle
                        distance = math.sqrt((circle["x"] - x)**2 + (circle["y"] - y)**2)
                        if distance < circle_radius:
                            if circle["number"] in [number1, number2]:
                                if circle["timestamp"] is None:
                                    circle["timestamp"] = current_time
                                # Draw "Correct!" message
                                cv2.rectangle(frame, (circle["x"] - 100, circle["y"] - 150),
                                              (circle["x"] + 100, circle["y"] - 100), correct_bg, -1)
                                cv2.putText(frame, "Correct!", (circle["x"] - 80, circle["y"] - 115),
                                            cv2.FONT_HERSHEY_SIMPLEX, 1, text_color, 2)
                            else:
                                # Draw "Try Again" message
                                cv2.rectangle(frame, (circle["x"] - 100, circle["y"] - 150),
                                              (circle["x"] + 100, circle["y"] - 100), try_again_bg, -1)
                                cv2.putText(frame, "Try Again", (circle["x"] - 80, circle["y"] - 115),
                                            cv2.FONT_HERSHEY_SIMPLEX, 1, text_color, 2)

        # Remove "Correct" circles after 2 seconds
        for circle in additional_circles:
            if circle["timestamp"] and current_time - circle["timestamp"] > 1:
                circle["visible"] = False

        # Show the frame
        cv2.imshow('Hand Tracking Game', frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

cap.release()
cv2.destroyAllWindows()
