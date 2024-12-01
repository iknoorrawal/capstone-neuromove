# from pyjoycon import JoyCon, get_R_id, get_L_id, GyroTrackingJoyCon
# import time
# from glm import vec3
# import matplotlib.pyplot as plt
# from matplotlib.animation import FuncAnimation

# #connecting joycon
# joycon_id = get_R_id()
# joycon = GyroTrackingJoyCon(*joycon_id)

# #load calibration offsets
# def load_calibration():
#     try:
#         with open("calibration_offsets.txt", "r") as f:
#             data = f.read().strip().split(",")
#             return vec3(float(data[0]), float(data[1]), float(data[2]))
#     except FileNotFoundError:
#         print("No calibration file found. Defaulting to (0, 0, 0).")
#         return vec3(0, 0, 0)

# #calibration_offsets = load_calibration()

# #calibrate 
# def calibrate():
#     try:
#         print("Starting calibration...")
#         joycon.calibrate(seconds=5)

#         time.sleep(5)
#         print("Calibration complete!")

#         direction = joycon.direction
#         if direction:
#             print("Direction (Z):", direction.z)
#             print("Direction (Y):", direction.y)
#         else:
#             print("Direction is not available (Joy-Con may not be pointing forward).")

#         gyro_offset = joycon.calibration_acumulator / joycon.calibration_acumulations
#         with open("calibration_offsets.txt", "w") as f:
#             f.write(f"{gyro_offset.x},{gyro_offset.y},{gyro_offset.z}")
#         print("Calibration data saved successfully!")

#     except Exception as e:
#         print("Error connecting to Joy-Con:", e)
#         return None


# x_data, y_data = [], []

# #get data
# def update_plot(frame):
#     direction = joycon.direction
#     if direction:
#         print(f"Raw Direction: {direction}")  # Debug: Print raw direction
#         #calibrated_direction = direction - calibration_offsets

#         direction_y = -direction.y  
#         direction_z = -direction.z  

#         x_data.append(direction_z)
#         y_data.append(direction_y)

#         if len(x_data) > 100:
#             x_data.pop(0)
#             y_data.pop(0)

#         line.set_data(x_data, y_data)

#     return line,


# #Setup the plot with fixed scale
# fig, ax = plt.subplots()
# line, = ax.plot([], [], 'ro-', markersize=4)  # Red dots with a connecting line
# ax.set_title("Live Joy-Con Direction Map (Vertical)")
# ax.set_xlabel("Horizontal (Z)")
# ax.set_ylabel("Vertical (Y)")
# ax.grid(True)

# #Set fixed scale for the axes
# fixed_axis_limit = 2
# ax.set_xlim(-fixed_axis_limit, fixed_axis_limit)
# ax.set_ylim(-fixed_axis_limit, fixed_axis_limit)

# #Use FuncAnimation to update the plot in real-time
# ani = FuncAnimation(fig, update_plot, interval=50)  # Updates every 50 ms

# #calibrate()
# plt.show() 

############## CODE 2

# from pyjoycon import JoyCon, get_R_id
# import numpy as np
# import matplotlib.pyplot as plt
# from matplotlib.animation import FuncAnimation
# import time

# # Get Joy-Con ID and initialize
# joycon_id = get_R_id()
# joycon = JoyCon(*joycon_id)

# # Initialize velocity and position
# velocity = np.array([0.0, 0.0, 0.0])  # m/s
# position = np.array([0.0, 0.0, 0.0])  # m

# # Data for plotting
# x_data, y_data = [], []

# # Start time for delta_time calculation
# last_time = time.time()

# # Update position
# def update_position(delta_time, accel_data):
#     global velocity, position

#     # Convert accelerometer data to m/s^2
#     accel = np.array(accel_data) * 9.8  # Assuming accel_data is normalized

#     # Integrate acceleration to get velocity
#     velocity += accel * delta_time

#     # Integrate velocity to get position
#     position += velocity * delta_time

#     return position

# # Update plot data
# def update_plot(frame):
#     global last_time

#     # Calculate delta_time
#     current_time = time.time()
#     delta_time = current_time - last_time
#     last_time = current_time

#     # Read accelerometer data
#     accel_data = joycon.get_status()['accel']  # Replace with your Joy-Con's method to get accelerometer data

#     # Update position
#     pos = update_position(delta_time, accel_data)

#     # Append position data
#     x_data.append(pos[0])  # X-axis movement
#     y_data.append(pos[1])  # Y-axis movement

#     # Limit points on plot
#     if len(x_data) > 100:
#         x_data.pop(0)
#         y_data.pop(0)

#     # Update line data
#     line.set_data(x_data, y_data)

#     return line,

# # Set up the live plot
# fig, ax = plt.subplots()
# line, = ax.plot([], [], 'ro-', markersize=4)
# ax.set_title("Live Joy-Con Position Tracking")
# ax.set_xlabel("Horizontal Position (m)")
# ax.set_ylabel("Vertical Position (m)")
# ax.grid(True)
# ax.set_xlim(-1, 1)  # Adjust as needed
# ax.set_ylim(-1, 1)

# # Create the animation
# ani = FuncAnimation(fig, update_plot, interval=50)  # Update every 50ms

# # Show the plot
# plt.show()

#CODE 3 
from pyjoycon import JoyCon, get_R_id
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
import time

# Get Joy-Con ID and initialize
joycon_id = get_R_id()
joycon = JoyCon(*joycon_id)

# Initialize velocity and position
velocity = np.array([0.0, 0.0, 0.0])  # m/s
position = np.array([0.0, 0.0, 0.0])  # m

# Data for plotting
x_data, y_data = [], []

# Start time for delta_time calculation
last_time = time.time()

# Update position
def update_position(delta_time, accel_data):
    global velocity, position

    # Convert accelerometer data to m/s^2
    accel = np.array(accel_data) * 9.8  # Assuming accel_data is normalized

    # Compensate for gravity
    gravity = np.array([0.0, 0.0, -9.8])  # Assuming Z-axis faces down
    corrected_accel = accel + gravity

    # Integrate acceleration to get velocity
    velocity += corrected_accel * delta_time

    # Integrate velocity to get position
    position += velocity * delta_time

    return position

# Update plot data
def update_plot(frame):
    global last_time

    # Calculate delta_time
    current_time = time.time()
    delta_time = current_time - last_time
    last_time = current_time

    # Read accelerometer data
    accel_data = joycon.get_status()['accel']  # Replace with Joy-Con's method to get accelerometer data

    # Update position
    pos = update_position(delta_time, accel_data)

    # Append position data
    x_data.append(pos[0])  # X-axis movement
    y_data.append(pos[1])  # Y-axis movement

    # Limit points on plot
    if len(x_data) > 100:
        x_data.pop(0)
        y_data.pop(0)

    # Update line data
    line.set_data(x_data, y_data)

    return line,

# Set up the live plot
fig, ax = plt.subplots()
line, = ax.plot([], [], 'ro-', markersize=4)
ax.set_title("Live Joy-Con Position Tracking (With Gravity Compensation)")
ax.set_xlabel("Horizontal Position (m)")
ax.set_ylabel("Vertical Position (m)")
ax.grid(True)
ax.set_xlim(-1, 1)  # Adjust as needed
ax.set_ylim(-1, 1)

# Create the animation
ani = FuncAnimation(fig, update_plot, interval=50)  # Update every 50ms

# Show the plot
plt.show()

