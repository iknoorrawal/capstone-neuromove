import argparse
import cv2
import mediapipe as mp
import time
import random

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

# Initialize variables for hand coordinates
left_hand_coord = None
right_hand_coord = None

# Additional circles
additional_circles = []
circle_radius = 50

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

        # Check if hands are detected and data hasn't been recorded yet
        if countdown == 1 and not recorded and results.multi_hand_landmarks:
            # Iterate over detected hands
            for idx, hand_landmarks in enumerate(results.multi_hand_landmarks):
                # Extract x, y positions of the index finger tip (Landmark 8)
                index_finger_tip = hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP]
                x, y = int(index_finger_tip.x * frame.shape[1]), int(index_finger_tip.y * frame.shape[0])

                # Assign left and right fingertip coordinates
                if idx == 0:  # Assume first hand is left
                    left_hand_coord = (x, y)
                elif idx == 1:  # Assume second hand is right
                    right_hand_coord = (x, y)

            # Generate additional circles with unique random numbers
            for _ in range(3):
                while True:
                    # Generate random coordinates
                    circle_x = random.randint(circle_radius, frame.shape[1] - circle_radius)
                    circle_y = random.randint(circle_radius, frame.shape[0] - circle_radius)

                    # Ensure the circle does not overlap with hands
                    if left_hand_coord and right_hand_coord:
                        if (abs(circle_x - left_hand_coord[0]) > circle_radius * 2 and
                                abs(circle_y - left_hand_coord[1]) > circle_radius * 2 and
                                abs(circle_x - right_hand_coord[0]) > circle_radius * 2 and
                                abs(circle_y - right_hand_coord[1]) > circle_radius * 2):
                            break
                # Generate a unique number different from number1 and number2
                while True:
                    random_number = random.randint(1, 100)
                    if random_number not in [number1, number2]:
                        break

                additional_circles.append({"x": circle_x, "y": circle_y, "number": random_number, "visible": True})

            recorded = True  # Set the flag to avoid re-recording
            game_started = True

        # Draw the circles on fingertips and their numbers
        if left_hand_coord:
            # Draw the left hand circle
            cv2.circle(frame, left_hand_coord, 50, (0, 0, 255), -1)  # Red circle for left hand
            cv2.putText(frame, str(number1), (left_hand_coord[0] - 15, left_hand_coord[1] + 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)

    # Append to additional_circles if not already added
            if not any(circle.get("type") == "left_hand" for circle in additional_circles):
                additional_circles.append({
                    "x": left_hand_coord[0],
                    "y": left_hand_coord[1],
                    "number": number1,
                    "visible": True,
                    "type": "left_hand"
                })

        if right_hand_coord:
            # Draw the right hand circle
            cv2.circle(frame, right_hand_coord, 50, (255, 0, 0), -1)  # Blue circle for right hand
            cv2.putText(frame, str(number2), (right_hand_coord[0] - 15, right_hand_coord[1] + 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)

        # Append to additional_circles if not already added
            if not any(circle.get("type") == "right_hand" for circle in additional_circles):
                additional_circles.append({
                    "x": right_hand_coord[0],
                    "y": right_hand_coord[1],
                    "number": number2,
                    "visible": True,
                    "type": "right_hand"
                })

        # Draw additional game circles
        if game_started:
            for circle in additional_circles:
                if circle["visible"]:
                    cv2.circle(frame, (circle["x"], circle["y"]), circle_radius, (0, 255, 0), -1)
                    cv2.putText(frame, str(circle["number"]),
                                (circle["x"] - 15, circle["y"] + 10),
                                cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)

        # Check if hands are detected
        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                # Draw landmarks on the frame
                mp_drawing.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)

                # Extract x, y positions of the index finger tip (Landmark 8)
                index_finger_tip = hand_landmarks.landmark[mp_hands.HandLandmark.INDEX_FINGER_TIP]
                x, y = int(index_finger_tip.x * frame.shape[1]), int(index_finger_tip.y * frame.shape[0])
                cv2.circle(frame, (x, y), 10, (0, 255, 0), -1)  # Green fingertip circle

                # Check if the finger touches a circle
                for circle in additional_circles:
                    print(circle)
                    if circle["visible"]:
                        # Calculate Euclidean distance between the fingertip and the circle's center
                        distance = ((circle["x"] - x) ** 2 + (circle["y"] - y) ** 2) ** 0.5
                        if distance < circle_radius:
                            # Only hide the circle if it corresponds to number1 or number2
                            if circle["number"] in [number1, number2] and abs(x - circle["x"]) < circle_radius and abs(y - circle["y"]) < circle_radius: 
                                cv2.putText(frame, "Correct!", (circle["x"], circle["y"] - 60),
                                            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                            else:
                                # Optional: Display a "Wrong!" message for incorrect circles
                                cv2.putText(frame, "Wrong!", (circle["x"], circle["y"] - 60),
                                            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

        # Show the frame
        cv2.imshow('Hand Tracking Game', frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

cap.release()
cv2.destroyAllWindows()

